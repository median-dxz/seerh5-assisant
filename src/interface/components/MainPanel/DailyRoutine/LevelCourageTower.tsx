import { Typography } from '@mui/material';
import { delay } from '@sa-core/common';
import { Battle, Functions, PetHelper, Utils } from '@sa-core/index';
import React from 'react';
import { PercentLinearProgress } from "../base";
import dataProvider from './data';
import { LevelBase, LevelExtendsProps } from './LevelBase';

interface LevelData {
    stimulation: boolean;
    rewardReceived: boolean;
    challengeCount: number;
    curLayer: number;
    layerCount: number;
}

const RoutineModuleName = '勇者之塔';
const customData = dataProvider['LevelCourageTower'];
const maxDailyChallengeTimes = 5;

const updateLevelData = async () => {
    const data = {} as LevelData;
    const bits = await Utils.GetBitSet(636, 1000577);
    const values = await Utils.GetMultiValue(18709, 18710);

    data.stimulation = bits[0];
    data.rewardReceived = bits[1];

    data.challengeCount = values[0];
    data.curLayer = values[1] & 255;
    data.layerCount = (values[1] >> 8) & 255;

    return data;
};

export function LevelCourageTower(props: LevelExtendsProps) {
    const { setRunning } = props;
    const [hint, setHint] = React.useState<JSX.Element | string>('');
    const [step, setStep] = React.useState(0);
    const levelData = React.useRef({} as LevelData);

    const effect = async () => {
        switch (step) {
            case 0: //init
                setRunning(true);
                setHint('正在查询关卡状态');
                levelData.current = await updateLevelData();
                console.log(levelData.current);
                if (!levelData.current.rewardReceived) {
                    if (levelData.current.challengeCount < maxDailyChallengeTimes) {
                        setStep(1);
                    } else {
                        setStep(2);
                    }
                } else {
                    setStep(3);
                }

                break;
            case 1: //daily challenge
                setHint('正在准备背包');
                await Functions.switchBag(customData.cts);
                PetHelper.cureAllPet();
                PetHelper.setDefault(customData.cts[0]);
                setHint('准备背包完成');
                await delay(500);

                if (levelData.current.curLayer !== 30) {
                    setHint('正在进入关卡');
                    await SA.Utils.SocketSendByQueue(42395, [101, 3, 30, 0]);
                    await delay(500);
                }

                Battle.Manager.strategy.custom = customData.strategy;
                while (levelData.current.challengeCount < maxDailyChallengeTimes) {
                    await Battle.Manager.runOnce(() => {
                        setHint(
                            <>
                                <Typography component={'div'}>正在进行对战...</Typography>
                                <PercentLinearProgress
                                    prompt={'当前次数'}
                                    progress={levelData.current.challengeCount}
                                    total={5}
                                />
                                <PercentLinearProgress
                                    prompt={'当前进度'}
                                    progress={levelData.current.layerCount}
                                    total={5}
                                />
                            </>
                        );
                        Utils.SocketSendByQueue(42396, [101, 30, levelData.current.layerCount + 1]);
                    });
                    levelData.current = await updateLevelData();
                }
                Battle.Manager.strategy.custom = undefined;
                setStep(0);

                break;
            case 2: //try get daily reward
                setHint('正在查询每日奖励领取状态');
                try {
                    await Utils.SocketSendByQueue(42395, [101, 4, 0, 0]);
                } catch (error) {
                    setStep(-1);
                }

                await delay(500);
                setStep(0);
                break;
            case -1:
                setHint('领取奖励出错');
                setRunning(false);
                break;
            default:
                setHint(RoutineModuleName +'日任完成');
                setRunning(false);
                break;
        }
    };
    React.useEffect(() => {
        effect();
    }, [step]);
    return <LevelBase title={RoutineModuleName} hint={hint}></LevelBase>;
}
