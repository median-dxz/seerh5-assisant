import { EVENTS } from '../const';

import Skill from '../entities/skill';

import { BattleInfoProvider, PetSwitchInfo, RoundInfo } from './infoprovider';
import { BattleOperator } from './operator';

import { delay } from '../common';

import { defaultStyle, SaModuleLogger } from '../logger';
const log = SaModuleLogger('BattleModuleManager', defaultStyle.core);

const { SAEventTarget } = window;

const handleBattleModule = () => {
    if (FighterModelFactory.playerMode == null || BattleModuleManager.running === false) return;
    BattleModuleManager.strategy.resolve();
};

const handleBattleEnd = (e: Event) => {
    if (e instanceof CustomEvent) {
        const { isWin } = e.detail as { isWin: boolean };
        if (BattleModuleManager.lockingTrigger) {
            BattleModuleManager.running = false;
            BattleModuleManager.lockingTrigger(isWin);
            BattleModuleManager.lockingTrigger = undefined;
        }
    }
};

namespace AutoBattle {
    export type Trigger = () => void;

    export type MoveModule = (battleStatus: RoundInfo, skills: Skill[], pets: PetSwitchInfo[]) => PromiseLike<void>;

    export interface Strategy {
        dsl: Array<string[]>;
        snm: Array<string[]>;
        custom?: MoveModule;
        default: {
            switchNoBlood: MoveModule;
            useSkill: MoveModule;
        };
        resolve(): void;
    }
}

const BattleModuleManager: {
    running: boolean;
    strategy: AutoBattle.Strategy;
    lockingTrigger?: (value: boolean | PromiseLike<boolean>) => void;
    runOnce(trigger: AutoBattle.Trigger): Promise<boolean>;
} = {
    running: false,

    strategy: {
        dsl: [],
        snm: [],
        custom: undefined,

        default: {
            switchNoBlood: async () => {
                BattleOperator.auto();
            },
            useSkill: async () => {
                BattleOperator.auto();
            },
        },

        async resolve() {
            const info = BattleInfoProvider.getCurRoundInfo()!;
            let skills = BattleInfoProvider.getCurSkills()!;
            const pets = BattleInfoProvider.getPets()!;

            if (this.custom != undefined) {
                this.custom(info, skills, pets);
                log('执行自定义行动策略');
                return;
            }

            let success = false;

            if (info.isDiedSwitch) {
                for (let petNames of this.dsl) {
                    const matcher = new BaseStrategy.DiedSwitchLinked(petNames);
                    const r = matcher.match(pets, info.self!.catchtime);
                    if (r !== -1) {
                        BattleOperator.switchPet(r);
                        success = true;
                        log(`精灵索引 ${r} 匹配成功: 死切链: [${petNames.join('|')}]`);
                        break;
                    }
                }

                if (!success) {
                    this.default.switchNoBlood(info, skills, pets);
                    log('执行默认死切策略');
                }

                await delay(300);
                skills = BattleInfoProvider.getCurSkills()!;
            }

            success = false;
            for (let skillNames of this.snm) {
                const matcher = new BaseStrategy.NameMatched(skillNames);
                const r = matcher.match(skills);
                if (r) {
                    BattleOperator.useSkill(r);
                    success = true;
                    log(`技能 ${r} 匹配成功: 技能组: [${skillNames.join('|')}]`);
                    break;
                }
            }

            if (!success) {
                this.default.useSkill(info, skills, pets);
                log('执行默认技能使用策略');
            }
        },
    },

    lockingTrigger: undefined,
    runOnce(trigger: AutoBattle.Trigger) {
        if (this.lockingTrigger == undefined) {
            this.running = true;
            trigger();
            return new Promise((resolve) => {
                this.lockingTrigger = resolve;
            });
        } else {
            return Promise.reject('已经有一场正在等待回调的战斗！');
        }
    },
};

SAEventTarget.addEventListener(EVENTS.BattlePanel.panelReady, handleBattleModule);
SAEventTarget.addEventListener(EVENTS.BattlePanel.roundEnd, handleBattleModule);
SAEventTarget.addEventListener(EVENTS.BattlePanel.completed, handleBattleEnd);

import * as BaseStrategy from './strategy';

export { BaseStrategy as BaseStrategy, AutoBattle };
export { BattleInfoProvider as InfoProvider, BattleOperator as Operator, BattleModuleManager as Manager };
