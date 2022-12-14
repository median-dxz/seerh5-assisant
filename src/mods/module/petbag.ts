import Pet from '@sa-core/entities/pet';
import { Const, EventHandler, Utils } from '@sa-core/index';
import { ReflectObjBase } from '@sa-core/mod-type';

import { delay, wrapper } from '@sa-core/common';
import { defaultStyle, SaModuleLogger } from '@sa-core/logger';
const log = SaModuleLogger('LocalCloth', defaultStyle.mod);

interface SkinInfo {
    skinId: number;
    petSkinId: number;
}

let item;
let clothArray: [Array<[number, SkinInfo]> | null, Array<[number, number]> | null] = [null, null];

item = window.localStorage.getItem('LocalSkin');
if (item) {
    clothArray = JSON.parse(item);
}

const changeCloth = new Map<number, SkinInfo>(clothArray[0]);
const originalCloth = new Map<number, number>(clothArray[1]);
let refresh: null | CallBack = null;

function saveToStorage() {
    clothArray = [Array.from(changeCloth.entries()), Array.from(originalCloth.entries())];
    window.localStorage.setItem('LocalSkin', JSON.stringify(clothArray));
}

class LocalCloth extends ReflectObjBase implements ModClass {
    subscriber: EventHandler.ModuleSubscriber<petBag.PetBag> = {
        load() {
            let protoFunc;
            protoFunc = petBag.SkinView.prototype.onChooseSkin;
            petBag.SkinView.prototype.onChooseSkin = wrapper(
                protoFunc,
                undefined,
                function (this: typeof petBag.SkinView) {
                    const t = this.arrayCollection.getItemAt(this.selectSkinIndex);
                    let skinId = 0;
                    if (t) {
                        if (t.id) {
                            EventManager.dispatchEventWith('petBag.SkinViewChangeSkin', !1, t.skinPetId);
                        }
                        skinId = t.id ?? 0;
                        this.btnPutOn.visible = skinId !== this.petInfo.skinId;
                        this.imgHasPutOn.visible = skinId === this.petInfo.skinId;
                    }

                    const n = PetXMLInfo.getName(t.monId),
                        r = PetSkinXMLInfo.getTypeCn(t.type),
                        a = t.name,
                        o = 0 === t.type;
                    o
                        ? ((this.txt1.text = '????????????'), (this.txt2.text = ''), (this.txt3.text = '????????????:' + n))
                        : ((this.txt1.text = r + '?????????' + a),
                          (this.txt2.text = '????????????:' + n),
                          void 0 === t.type
                              ? (this.txt3.text = '??????????????????')
                              : t.shopId
                              ? (this.txt3.text = '????????????')
                              : t.go || t.goType
                              ? (this.txt3.text = '????????????')
                              : (this.txt3.text = '????????????????????????'));
                }
            );
        },
        destroy(ctx) {
            if (refresh) {
                SocketConnection.removeCmdListener(Const.CMDID.PET_DEFAULT, refresh);
                SocketConnection.removeCmdListener(Const.CMDID.PET_RELEASE, refresh);
                SocketConnection.removeCmdListener(Const.CMDID.PET_ONE_CURE, refresh);
                SocketConnection.removeCmdListener(Const.CMDID.PET_CURE, refresh);
            }
        },
        async show(ctx) {
            while (!ctx.currentPanel) {
                await delay(100); // ??????????????????????????????????????????
            }

            const panel = ctx.currentPanel!;
            panel.initBagView = wrapper(
                panel.initBagView,
                () => {
                    panel.uiChangePetFlag = true;
                },
                () => {
                    panel.uiChangePetFlag = false;
                }
            );

            panel.checkChangePosition = wrapper(
                panel.checkChangePosition,
                () => {
                    panel.uiChangePetFlag = true;
                },
                () => {
                    panel.uiChangePetFlag = false;
                }
            );

            refresh = async () => {
                if (!ctx.currentPanel?.uiChangePetFlag) {
                    await delay(100);
                    ctx.currentPanel?.initBagView();
                }
            };

            EventManager.addEventListener(
                'petBag.MainPanelTouchPetItemBegin',
                (e: egret.TouchEvent) => {
                    const { petInfo } = e.data as { petInfo: PetInfo };
                    petInfo && log(new Pet(petInfo));
                },
                null
            );

            if (refresh) {
                SocketConnection.addCmdListener(Const.CMDID.PET_DEFAULT, refresh);
                SocketConnection.addCmdListener(Const.CMDID.PET_RELEASE, refresh);
                SocketConnection.addCmdListener(Const.CMDID.PET_ONE_CURE, refresh);
                SocketConnection.addCmdListener(Const.CMDID.PET_CURE, refresh);
            }
        },
    };
    constructor() {
        super();

        Object.defineProperty(FighterUserInfo.prototype, 'petInfoArr', {
            get: function () {
                return this._petInfoArr;
            },
            set: function (t) {
                const skinId = (r: any) => (this.id == MainManager.actorID ? r.skinId : r._skinId ?? 0);
                (this._petInfoArr = t),
                    (this._petIDArr = []),
                    (this._petCatchArr = []),
                    (this._petSkillIDArr = []),
                    (this._aliveNum = 0);
                for (var e = 0, n = this._petInfoArr; e < n.length; e++) {
                    var r = n[e],
                        o = PetFightSkinSkillReplaceXMLInfo.getSkills(this.id == skinId(r), r.id),
                        i = r.id;
                    (i = PetIdTransform.getPetId(i, r.catchTime, !0)),
                        0 != skinId(r) && (i = PetSkinXMLInfo.getSkinPetId(skinId(r), r.id)),
                        this._petIDArr.push(i),
                        this._petCatchArr.push(r.catchTime);
                    for (var s = 0, _ = r.skillArray; s < _.length; s++) {
                        var a = _[s];
                        a instanceof PetSkillInfo
                            ? this.add2List(this._petSkillIDArr, a.id, o)
                            : this.add2List(this._petSkillIDArr, a, o);
                    }
                    var c = SkillXMLInfo.getHideSkillId(r.id);
                    16689 == c && (c = 16839),
                        this.add2List(this._petSkillIDArr, c, o),
                        r.hideSKill && this.add2List(this._petSkillIDArr, r.hideSKill.id, o),
                        r.hp > 0 && this._aliveNum++;
                }
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(FightPetInfo.prototype, 'skinId', {
            get: function () {
                return changeCloth.has(this._petID) && this.userID == MainManager.actorID
                    ? changeCloth.get(this._petID)!.skinId
                    : this._skinId;
            },
            set: function (t) {
                this._skinId = t;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(PetInfo.prototype, 'skinId', {
            get: function () {
                return changeCloth.has(this.id) ? changeCloth.get(this.id)!.skinId : this._skinId ?? 0;
            },
            set: function (t) {
                this._skinId = t;
            },
            enumerable: !0,
            configurable: !0,
        });
        PetManager.equipSkin = async function (catchTime, skinId, callback) {
            let _skinId = skinId ?? 0;
            let petInfo = PetManager.getPetInfo(catchTime);
            log('new skin id:', _skinId, 'previous skin id:', petInfo.skinId);
            if (
                (_skinId === 0 || PetSkinController.instance.haveSkin(_skinId)) &&
                (!originalCloth.has(petInfo.id) || originalCloth.get(petInfo.id) !== _skinId)
            ) {
                changeCloth.delete(petInfo.id);
                originalCloth.set(petInfo.id, _skinId);
                saveToStorage();
                await Utils.SocketSendByQueue(47310, [catchTime, skinId]);
            } else {
                if (!originalCloth.has(petInfo.id)) {
                    originalCloth.set(petInfo.id, petInfo.skinId);
                }
                changeCloth.set(petInfo.id, {
                    skinId: _skinId,
                    petSkinId: PetSkinXMLInfo.getSkinPetId(_skinId, petInfo.id),
                });
                saveToStorage();
            }
            petInfo = PetManager.getPetInfo(catchTime);
            petInfo.skinId = _skinId;
            PetManager.dispatchEvent(new PetEvent(PetEvent.EQUIP_SKIN, catchTime, _skinId));
            callback && callback();
        };

        EventHandler.SeerModuleStatePublisher.attach(this.subscriber, 'petBag');
    }

    meta = { description: '?????????????????????' };
    init() {}
    destroy() {
        EventHandler.SeerModuleStatePublisher.detach(this.subscriber, 'petBag');
    }
}

export default {
    mod: LocalCloth,
};
