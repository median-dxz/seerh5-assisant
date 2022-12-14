import { Box, Fade, SxProps, Tab, Tabs } from '@mui/material';
import { mainColor } from '@sa-ui/style';
import * as React from 'react';
import { BattleManager } from './BattleManager';
import { CommonValue } from './CommonValue';
import { DailyRoutine } from './DailyRoutine';
import { PackageCapture } from './PackageCapture';
import { PetBag } from './PetBag';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps & { sx?: SxProps }) {
    const { sx, children, value, index, ...other } = props;

    return (
        <Box
            sx={{
                p: 1,
                width: '100%',
                overflow: 'auto',
                marginRight: '-1px',
                '&::-webkit-scrollbar': {
                    width: 8,
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: `rgba(${mainColor.front} / 16%)`,
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: `rgba(${mainColor.front} / 90%)`,
                },
                ...sx,
            }}
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && children}
        </Box>
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

interface Props {
    show: boolean;
}

export function MainPanel(props: Props) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Fade in={props.show}>
            <Box
                sx={{
                    position: 'absolute',
                    display: 'flex',
                    top: '12vh',
                    left: 'calc((100vw - 60vw) / 2)',
                    width: '60vw',
                    height: '75vh',
                    zIndex: 1,
                    color: `rgba(${mainColor.front} / 100%)`,
                    bgcolor: `rgba(${mainColor.back} / 35%)`,
                    border: `2px solid rgba(${mainColor.front} / 75%)`,
                    backdropFilter: `blur(8px)`,
                    boxShadow: `0 0 16px rgba(${mainColor.front} / 50%),
                    0 0 16px rgba(${mainColor.back} / 50%) inset`,
                }}
                onClick={(e) => {
                    e.nativeEvent.stopPropagation();
                }}
            >
                <Tabs
                    orientation="vertical"
                    value={value}
                    onChange={handleChange}
                    aria-label="SA Main Panel Tabs"
                    sx={{
                        minWidth: '155px',
                        bgcolor: `rgba(${mainColor.back} / 12%)`,
                        borderRight: 1,
                        // backdropFilter: `blur(8px)`,
                        borderColor: 'rgba(255 255 255 / 12%)',
                        paddingBlockStart: '10%',
                    }}
                >
                    <Tab label="???????????????" {...a11yProps(0)} />
                    <Tab label="??????????????????" {...a11yProps(1)} />
                    <Tab label="????????????" {...a11yProps(2)} />
                    <Tab label="????????????" {...a11yProps(3)} />
                    <Tab label="?????????????????????" {...a11yProps(4)} />
                    <Tab label="????????????" {...a11yProps(5)} />
                </Tabs>
                <TabPanel value={value} index={0}></TabPanel>
                <TabPanel value={value} index={1}>
                    <CommonValue />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <DailyRoutine />
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <PetBag />
                </TabPanel>
                <TabPanel value={value} index={4}>
                    <BattleManager />
                </TabPanel>
                <TabPanel value={value} index={5}>
                    <PackageCapture />
                </TabPanel>
            </Box>
        </Fade>
    );
}
