import { AssignmentInd, Medication, MenuOpen, ScheduleSend, SmartToy } from '@mui/icons-material';
import { SpeedDialAction } from '@mui/material';
import { SxProps } from '@mui/system';

import React, { useEffect, useState } from 'react';

import { mainColor } from '@sa-ui/style';
import { StyledSpeedDial } from './StyledSpeedDial';

const iconSx: SxProps = {
    color: `rgba(${mainColor.front} / 100%)`,
    filter: `drop-shadow(0 0 8px rgba(${mainColor.back} / 75%))`,
    opacity: 1,
};

const actions = [
    { icon: <Medication sx={iconSx} />, name: '自动治疗' },
    { icon: <SmartToy sx={iconSx} />, name: '对战谱尼' },
    { icon: <AssignmentInd sx={iconSx} />, name: '一键签到' },
    { icon: <ScheduleSend sx={iconSx} />, name: '一键战队派遣' },
];

export function MainMenu() {
    const { PetHelper } = SA;

    let [autoCure, setAutoCure] = useState(false);
    let [open, setOpen] = useState(false);

    useEffect(() => {
        PetHelper.getAutoCureState().then(setAutoCure);
    }, []);

    actions[0].name = `自动治疗:${autoCure ? '开' : '关'}`;

    const handleClicks = [
        () => {
            autoCure = !autoCure;
            setAutoCure(autoCure);
            PetHelper.toggleAutoCure(autoCure);
        },
        () => {
            FightManager.fightNoMapBoss(6730);
        },
        () => {
            const { SAMods: mods } = window;
            mods.get('sign')!.run!();
        },
        () => {
            const { SAMods: mods } = window;
            mods.get('sign')!.reflect('teamDispatch');
        },
    ];

    return (
        <StyledSpeedDial
            ariaLabel="Seerh5 Assistant Main Menu Button"
            icon={<MenuOpen />}
            direction="right"
            sx={{
                position: 'absolute',
                bottom: '8vh',
                left: '4vw',
                zIndex: 2,
            }}
            open={open}
            onOpen={(event, reason) => {
                setOpen(true);
            }}
            onClose={(event, reason) => {
                if (reason !== 'blur') {
                    setOpen(false);
                }
            }}
        >
            {actions.map((action, index) => (
                <SpeedDialAction
                    key={index}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={() => {
                        handleClicks[index](), setOpen(true);
                    }}
                />
            ))}
        </StyledSpeedDial>
    );
}
