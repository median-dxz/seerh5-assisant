import * as BattleModule from '../battle';
import { CMDID, ITEMS, MULTI, PET_POS } from '../const';
import * as PetHelper from '../pet-helper';
import { BuyPetItem, GetMultiValue, SocketSendByQueue } from '../utils';

import { delay } from '../common';
import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('SAFunctions', defaultStyle.mod);

type PotionId = AttrConst<typeof ITEMS.Potion>;
/**
 * @param {number[]} cts 要压血的精灵列表
 * @param {PotionId} healPotionId 血药id, 默认中级体力药
 * @description 利用谱尼封印自动压血
 */
export async function lowerBlood(cts: number[], healPotionId: PotionId = ITEMS.Potion.中级体力药剂): Promise<void> {
    cts = cts.slice(0, 6);
    cts = cts.filter(PetManager.getPetInfo.bind(PetManager));
    if (!cts || cts.length === 0) {
        return;
    }

    // 检测列表是否全在背包
    let curPets = await PetHelper.getBagPets(PET_POS.bag1);

    for (let ct of cts) {
        if ((await PetHelper.getPetLocation(ct)) !== PET_POS.bag1) {
            if (PetManager.isBagFull) {
                let replacePet = curPets.find((p) => !cts.includes(p.catchTime))!;
                log(`压血 -> 将 ${replacePet.name} 放入仓库`);
                await PetHelper.popPetFromBag(replacePet.catchTime);
                curPets = await PetHelper.getBagPets(PET_POS.bag1);
            }
            await PetHelper.setPetLocation(ct, PET_POS.bag1);
        }
    }
    log(`压血 -> 背包处理完成`);

    const hpChecker = () => cts.filter((ct) => PetManager.getPetInfo(ct).hp >= 200);

    const usePotion = (ct: number) => {
        if (PetManager.getPetInfo(ct).hp <= 50) {
            usePotionForPet(ct, healPotionId);
        }
        usePotionForPet(ct, ITEMS.Potion.中级活力药剂);
    };

    await delay(300);
    if (hpChecker().length === 0) {
        cts.forEach(usePotion);
        return;
    }

    BuyPetItem(ITEMS.Potion.中级活力药剂, cts.length);
    BuyPetItem(healPotionId, cts.length);
    PetHelper.setDefault(cts[0]);
    await delay(300);

    const { Manager, Operator, InfoProvider } = BattleModule;

    Manager.strategy.custom = async (battleStatus, skills, battlePets) => {
        if (battleStatus.round > 0 && battleStatus.self?.hp.remain! < 50) {
            let nextPet = battlePets.findIndex(
                (v) => cts.includes(v.catchTime) && v.hp > 200 && v.catchTime !== battleStatus.self!.catchtime
            );

            if (nextPet === -1) {
                Operator.escape();
                return;
            }
            await Operator.switchPet(nextPet);
            if (battleStatus.isDiedSwitch) {
                skills = InfoProvider.getCurSkills()!;
                Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
            }
        } else {
            Operator.useSkill(skills.find((v) => v.category !== 4)!.id);
        }
    };

    return BattleModule.Manager.runOnce(() => {
        FightManager.fightNoMapBoss(6730);
    }).then(() => {
        cts.forEach(usePotion);
        let leftCts = hpChecker();
        if (leftCts.length > 0) {
            return lowerBlood(leftCts, healPotionId);
        } else {
            Manager.strategy.custom = undefined;
        }
    });
}

/**
 * @description 对精灵使用药水
 */
export function usePotionForPet(catchTime: number, potionId: number) {
    return SocketSendByQueue(CMDID.USE_PET_ITEM_OUT_OF_FIGHT, [catchTime, potionId]);
}

export async function switchBag(cts: number[]) {
    if (!cts || cts.length === 0) return;
    // 清空现有背包
    for (let v of await PetHelper.getBagPets(PET_POS.bag1)) {
        await PetHelper.popPetFromBag(v.catchTime);
        log(`SwitchBag -> 将 ${v.name} 放入仓库`);
    }
    for (let v of cts) {
        await PetHelper.setPetLocation(v, PET_POS.bag1);
        log(`SwitchBag -> 将 ${PetManager.getPetInfo(v).name} 放入背包`);
    }
}

/**
 * @description 计算可用的高倍克制精灵(默认大于等于1.5)
 */
export async function calcAllEfficientPet(e: number, radio: number = 1.5) {
    await PetHelper.updateStorageInfo();
    let pets = [
        ...PetStorage2015InfoManager.allInfo,
        ...PetManager._bagMap.getValues(),
        ...PetManager._secondBagMap.getValues(),
    ];
    let r = pets.filter((v) => PetHelper.calcElementRatio(PetXMLInfo.getType(v.id), e) >= radio);
    return r.map((v) => {
        let eid = PetXMLInfo.getType(v.id);
        return {
            name: v.name,
            elementId: eid,
            element: SkillXMLInfo.typeMap[eid].cn,
            id: v.id,
            ratio: PetHelper.calcElementRatio(eid, e),
        };
    });
}

export async function delCounterMark() {
    const universalMarks = CountermarkController.getAllUniversalMark().reduce((pre, v) => {
        const name = v.markName;
        if (v.catchTime === 0 && v.isBindMon === false && v.level < 5) {
            if (pre.has(name)) {
                pre.get(name)!.push(v);
            } else {
                pre.set(v.markName, [v]);
            }
        }
        return pre;
    }, new Map<string, CountermarkInfo[]>());

    for (let [k, v] of universalMarks) {
        if (v.length > 5) {
            for (let i in v) {
                if (parseInt(i) >= 14) {
                    const mark = v[i];
                    await SocketSendByQueue(CMDID.COUNTERMARK_RESOLVE, mark.obtainTime);
                    await delay(100);
                }
            }
        }
    }
}

export async function updateBattleFireInfo() {
    return GetMultiValue(MULTI.战斗火焰.类型, MULTI.战斗火焰.到期时间戳).then((r) => {
        return {
            type: r[0],
            valid: r[1] > 0 && SystemTimerManager.time < r[1],
            timeLeft: r[1] - SystemTimerManager.time,
        };
    });
}
