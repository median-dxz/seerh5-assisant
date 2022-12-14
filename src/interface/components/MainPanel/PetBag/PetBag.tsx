import {
    Button,
    Checkbox,
    Divider,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { delay } from '@sa-core/common';
import Pet from '@sa-core/entities/pet';
import { mainColor } from '@sa-ui/style';
import React from 'react';

const numberFormat = Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
});

interface MenuOption {
    type: 'suit' | 'title' | 'savePets' | 'setPets';
    id: number[];
    options: string[];
}

export function PetBag() {
    const { Utils, PetHelper, Functions, Const } = SA;
    type BattleFireInfo = Awaited<ReturnType<typeof Functions.updateBattleFireInfo>>;
    const [battleFire, setBattleFire] = React.useState<BattleFireInfo>({ timeLeft: 0, type: 0, valid: false });
    const [timeLeft, setTimeLeft] = React.useState(0);
    const [timer, setTimer] = React.useState<undefined | number>(undefined);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuOption = React.useRef<MenuOption | null>(null);
    const [pets, setPets] = React.useState<Pet[]>([]);
    const [petsSelected, setPetsSelected] = React.useState<boolean[]>([]);
    const [petPatterns, setPetPattern] = React.useState(() => {
        let item: any[] | null | string = window.localStorage.getItem('PetPattern');
        if (!item) {
            item = Array(6);
        } else {
            item = JSON.parse(item);
        }
        return item as Array<number[]>;
    });

    const [userTitle, setUserTitle] = React.useState(Utils.UserTitle());
    const [userSuit, setUserSuit] = React.useState(Utils.UserSuit());

    const updateBattleFire = async () => {
        const info = await Functions.updateBattleFireInfo();
        setBattleFire(info);
        setTimeLeft(info.timeLeft);
        return info;
    };

    React.useEffect(() => {
        updateBattleFire();
        PetHelper.getBagPets(Const.PET_POS.bag1).then((r) => {
            setPets(r);
            setPetsSelected(Array(r.length).fill(false));
        });
    }, []);

    React.useEffect(() => {
        if (battleFire.timeLeft <= 0 || battleFire.valid === false) {
            clearInterval(timer);
            setTimer(undefined);
        } else {
            if (window) {
                const { setInterval } = window;
                clearInterval(timer);
                setTimer(
                    setInterval(() => {
                        if (timeLeft <= 0) {
                            updateBattleFire();
                        } else {
                            setTimeLeft((t) => t - 1);
                        }
                    }, 1000)
                );
            }
        }
        return () => clearInterval(timer);
    }, [battleFire]);

    return (
        <>
            <Button
                onClick={() => {
                    ModuleManager.showModule('petBag');
                }}
            >
                ??????????????????
            </Button>
            <Button onClick={PetHelper.cureAllPet}>????????????</Button>
            <Divider />
            <h3>????????????</h3>
            <Typography
                color={
                    !battleFire.valid
                        ? 'inherit'
                        : battleFire.type === Const.BATTLE_FIRE.??????
                        ? 'green'
                        : battleFire.type === Const.BATTLE_FIRE.??????
                        ? 'gold'
                        : 'inherit'
                }
            >
                {!battleFire.valid
                    ? '?????????'
                    : battleFire.type === Const.BATTLE_FIRE.??????
                    ? '?????????: ??????'
                    : battleFire.type === Const.BATTLE_FIRE.??????
                    ? '?????????: ??????'
                    : '????????????'}{' '}
                {battleFire.valid &&
                    `????????????: ${numberFormat.format(Math.trunc(timeLeft / 60))}:${numberFormat.format(timeLeft % 60)}`}
                <Button onClick={updateBattleFire}>??????</Button>
            </Typography>
            <Divider />
            <h3>?????? / ??????</h3>
            <Typography display="flex" alignItems="baseline">
                ????????????:
                <Button
                    onClick={(e) => {
                        const suitId = Utils.UserAbilitySuits();
                        const suitName = suitId.map<string>(SuitXMLInfo.getName.bind(SuitXMLInfo));
                        menuOption.current = {
                            type: 'suit',
                            id: suitId,
                            options: suitName,
                        };
                        setAnchorEl(e.currentTarget);
                        setMenuOpen(true);
                    }}
                >
                    {SuitXMLInfo.getName(userSuit)}
                </Button>
                ??????: {ItemSeXMLInfo.getSuitEff(userSuit)}
            </Typography>

            <Typography display="flex" alignItems="baseline">
                ????????????:
                <Button
                    onClick={async (e) => {
                        setAnchorEl(e.currentTarget);
                        const titleId = await Utils.UserAbilityTitles();
                        const titleName = titleId.map<string>(AchieveXMLInfo.getTitle.bind(AchieveXMLInfo));
                        menuOption.current = {
                            type: 'title',
                            id: titleId,
                            options: titleName,
                        };
                        setMenuOpen(true);
                    }}
                >
                    {AchieveXMLInfo.getTitle(userTitle)}
                </Button>
                ??????: {AchieveXMLInfo.getTitleEffDesc(userTitle)}
            </Typography>
            <Menu
                id="suit-select-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => {
                    setAnchorEl(null);
                    setMenuOpen(false);
                }}
                MenuListProps={{
                    role: 'listbox',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        bgcolor: `rgba(${mainColor.front} / 18%)`,
                        backdropFilter: 'blur(4px)',
                    },
                }}
            >
                {menuOption.current?.options.map((option, index) => (
                    <MenuItem
                        key={option}
                        onClick={async (e) => {
                            const info = menuOption.current!;
                            if (info.type === 'suit') {
                                Utils.ChangeSuit(info.id[index]);
                                setUserSuit(info.id[index]);
                            } else if (info.type === 'title') {
                                Utils.ChangeTitle(info.id[index]);
                                setUserTitle(info.id[index]);
                            } else if (info.type === 'setPets') {
                                Functions.switchBag(petPatterns[index]);
                            } else if (info.type === 'savePets') {
                                const newPets = await PetHelper.getBagPets(1);
                                setPetPattern((petPatterns) => {
                                    const newValue = [...petPatterns];
                                    newValue[index] = newPets.map((pet) => pet.catchTime);
                                    window.localStorage.setItem('PetPatterns', JSON.stringify(newValue));
                                    return newValue;
                                });
                            }
                            setAnchorEl(null);
                            setMenuOpen(false);
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>

            <Divider />
            <h3>????????????</h3>
            <Button
                onClick={() => {
                    const lowerBloodPets = pets.filter((pet, index) => petsSelected[index]).map((r) => r.catchTime);
                    Functions.lowerBlood(lowerBloodPets);
                }}
            >
                ??????
            </Button>
            <Button
                onClick={() => {
                    const curePets = pets.filter((pet, index) => petsSelected[index]).map((r) => r.catchTime);
                    for (let curePet of curePets) {
                        PetHelper.cureOnePet(curePet);
                    }
                }}
            >
                ??????
            </Button>
            <Button
                onClick={() => {
                    console.log(pets.map((pet) => ({ name: pet.name, catchTime: pet.catchTime })));
                }}
            >
                dump
            </Button>
            <Button
                onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    const patternName = Array(petPatterns.length)
                        .fill('')
                        .map((v, index) => `??????${index}`);
                    menuOption.current = {
                        type: 'setPets',
                        id: Array(petPatterns.length)
                            .fill(0)
                            .map((v, index) => index),
                        options: patternName,
                    };
                    setMenuOpen(true);
                }}
            >
                ????????????
            </Button>
            <Button
                onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    const patternName = Array(petPatterns.length)
                        .fill('')
                        .map((v, index) => `??????${index}`);
                    menuOption.current = {
                        type: 'savePets',
                        id: Array(petPatterns.length)
                            .fill(0)
                            .map((v, index) => index),
                        options: patternName,
                    };
                    setMenuOpen(true);
                }}
            >
                ????????????
            </Button>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">id</TableCell>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">??????</TableCell>
                        <TableCell align="center">??????</TableCell>
                        <TableCell align="center">??????</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pets.map((row, index) => (
                        <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell align="center">
                                <Checkbox
                                    color="primary"
                                    checked={petsSelected[index]}
                                    onChange={(event) => {
                                        petsSelected.splice(index, 1, event.target.checked);
                                        setPetsSelected([...petsSelected]);
                                    }}
                                />
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">
                                {row.id}
                            </TableCell>
                            <TableCell align="center">
                                <img crossOrigin="anonymous" src={ClientConfig.getPetHeadPath(row.id)} width={48}></img>
                            </TableCell>
                            <TableCell align="center">{row.name}</TableCell>
                            <TableCell align="center">
                                {row.hp} / {row.maxHp}
                            </TableCell>
                            <TableCell align="center">
                                <Button
                                    onClick={async () => {
                                        await ModuleManager.showModule('petBag');
                                        const petBagModule = ModuleManager.currModule as petBag.PetBag;
                                        const petBagPanel = petBagModule.currentPanel as petBag.MainPanel;
                                        await delay(300);
                                        petBagPanel.onSelectPet({ data: PetManager.getPetInfo(row.catchTime) });
                                        await delay(300);
                                        petBagPanel.showDevelopBaseView();
                                        petBagPanel.showDevelopView(9);
                                    }}
                                >
                                    ??????
                                </Button>
                                <Button
                                    onClick={() => {
                                        PetHelper.cureOnePet(row.catchTime);
                                    }}
                                >
                                    ??????
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}
