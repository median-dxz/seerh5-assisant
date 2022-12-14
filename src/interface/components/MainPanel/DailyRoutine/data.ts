import { AutoBattle, BaseStrategy, generateStrategy, InfoProvider, Operator } from '@sa-core/battle';
import { delay } from '@sa-core/common';

interface LevelPetsData {
    [levelName: string]: {
        cts: number[];
        strategy: AutoBattle.MoveModule;
    };
}

const data: LevelPetsData = {
    LevelXTeamRoom: {
        cts: [1656056275, 1656945596, 1657863632],
        strategy: generateStrategy(['幻梦芳逝', '剑挥四方', '破寂同灾'], ['蒂朵', '六界帝神', '深渊狱神·哈迪斯']),
    },
    LevelExpTraining: {
        cts: [1656055512, 1656056275, 1656302059, 1656945596],
        strategy: generateStrategy(['时空牵绊', '王·龙子盛威决', '破寂同灾', '竭血残蝶'], ['幻影蝶', '蒂朵']),
    },
    LevelStudyTraining: {
        cts: [1656055512, 1655101462, 1656302059, 1657039061],
        strategy: generateStrategy(['有女初长成', '王·龙子盛威决', '竭血残蝶'], ['幻影蝶', '艾欧丽娅', '千裳']),
    },
    LevelCourageTower: {
        cts: [1656055512, 1656302059, 1656056275, 1656092908],
        strategy: async (round, skills, pets) => {
            const snm = new BaseStrategy.SkillNameMatch(['王·龙子盛威决', '竭血残蝶', '时空牵绊']);
            const dsl = new BaseStrategy.DiedSwitchLink(['幻影蝶', '圣灵谱尼', '蒂朵']);
            if (round.isDiedSwitch) {
                const r = dsl.match(pets, round.self!.catchtime);
                if (r !== -1) {
                    Operator.switchPet(r);
                } else {
                    Operator.auto();
                }
                await delay(600);
                skills = InfoProvider.getCurSkills()!;
            }
            const r = snm.match(skills);
            if (r) {
                Operator.useSkill(r);
            } else {
                const r = skills.find((skill) => skill.name === ['光荣之梦', '神灵救世光'][round.round % 2]);
                if (r) {
                    Operator.useSkill(r.id);
                } else {
                    Operator.auto();
                }
            }
        },
    },
    LevelTitanHole: {
        cts: [1656055512, 1656945596, 1657863632, 1655101462],
        strategy: generateStrategy(['竭血残蝶', '剑挥四方', '破寂同灾'], ['幻影蝶', '六界帝神', '深渊狱神·哈迪斯']),
    },
};

export default data;
