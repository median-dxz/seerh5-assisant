export async function GetMultiValue(...value: number[]): Promise<number[]> {
    if (!value) return [];
    return KTool.getMultiValueAsync(value);
}

export async function GetBitSet(...value: number[]): Promise<boolean[]> {
    if (!value) return [];
    return KTool.getBitSetAsync(value).then((r) => r.map(Boolean));
}

let DictMatcher = <T extends SAType.BaseObj>(dict: SAType.Dict<T>, reg: RegExp, keyName: string) => {
    return Object.values(dict).filter(
        (value) => Object.hasOwn(value, keyName) && (value[keyName] as string).match(reg)
    );
};

export function matchItemName(nameReg: RegExp) {
    return DictMatcher(ItemXMLInfo._itemDict, nameReg, 'Name');
}

export function matchSkillName(nameReg: RegExp) {
    return DictMatcher(SkillXMLInfo.movesMap, nameReg, 'Name');
}

export function matchPetName(nameReg: RegExp) {
    return DictMatcher(PetXMLInfo._dataMap, nameReg, 'DefName');
}

export function getTypeIdByName(name: any) {
    return Object.values(SkillXMLInfo.typeMap).find((v) => v.cn.match(name))?.id;
}

export async function getStatusName(id: any) {
    return PetStatusEffectConfig.getName(0, id);
}

export * from './item-helper';
export * from './module-helper';
export * from './player-helper';
export * from './socket';

