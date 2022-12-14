import { CssBaseline } from '@mui/material';
import { Container, ThemeProvider } from '@mui/system';
import React, { Fragment, useEffect, useState } from 'react';
import { CommandBar } from './components/CommandBar';
import { MainButton } from './components/MainButton';
import { MainMenu } from './components/MainMenu';
import { MainPanel } from './components/MainPanel';
import { mainTheme } from './style';

export function SaMain() {
    const [isCommandBarOpen, toggleCommandBar] = useState(false);
    const [isMainPanelOpen, toggleMainPanel] = useState(false);

    const shortCutHandler = function (e: KeyboardEvent | React.KeyboardEvent) {
        if (e.key === 'p' && e.ctrlKey) {
            toggleCommandBar((preState) => !preState);
            e.preventDefault();
        }
    };

    const clickHandler = function (e: MouseEvent | React.MouseEvent) {
        if (
            e.button === 0 &&
            document.querySelector('.MuiDialog-root[role=presentation]') == null &&
            document.querySelector('.MuiPopover-root[role=presentation]') == null
        ) {
            toggleMainPanel(false);
        }
    };

    useEffect(() => {
        document.body.addEventListener('keydown', shortCutHandler);
        document.body.addEventListener('click', clickHandler);
        return () => {
            document.body.removeEventListener('keydown', shortCutHandler);
            document.body.addEventListener('click', clickHandler);
        };
    }, []);

    return (
        <Fragment>
            <CssBaseline />
            <ThemeProvider theme={mainTheme}>
                <Container id="sa-main">
                    <MainMenu />
                    <MainButton
                        onClick={(e) => {
                            toggleMainPanel((preState) => !preState);
                            e.nativeEvent.stopPropagation();
                        }}
                    />
                    <CommandBar show={isCommandBarOpen} />
                    <MainPanel show={isMainPanelOpen} />
                </Container>
            </ThemeProvider>
        </Fragment>
    );
}
