import CLOSE_ICON from 'assets/SVG/close.svg';
import button from 'view/controls/components/button';
import SettingsMenuTemplate from 'view/controls/templates/settings/menu';
import { createElement, emptyElement, prependChild } from 'utils/dom';

export function SettingsMenu(onVisibility, onSubmenuAdded, onMenuEmpty) {
    const documentClickHandler = (e) => {
        // Close if anything other than the settings menu has been clicked
        // Let the display (jw-video) handles closing itself (display clicks do not pause if the menu is open)
        // Don't close if the user has dismissed the nextup tooltip via it's close button (the tooltip overlays the menu)
        const targetClass = e.target.className;
        if (!targetClass.match(/jw-(settings|video|nextup-close|sharing-link)/)) {
            instance.close();
        }
    };

    let visible;
    let active = null;
    const submenus = {};
    const settingsMenuElement = createElement(SettingsMenuTemplate());
    const topbarElement = settingsMenuElement.querySelector('.jw-settings-topbar');

    const closeButton = button('jw-settings-close', () => {
        instance.close();
    }, 'Close Settings', [CLOSE_ICON]);
    closeButton.show();
    closeButton.element().addEventListener('keydown', function(evt) {
        if (evt.keyCode !== 9) {
            return;
        }

        instance.close();
    });

    topbarElement.appendChild(closeButton.element());

    const keyHandler = function(evt) {
        if (evt && evt.keyCode === 27) {
            instance.close();
            evt.stopPropagation();
        }
    };

    settingsMenuElement.addEventListener('keydown', keyHandler);

    const instance = {
        open(isDefault) {
            visible = true;
            onVisibility(visible);
            settingsMenuElement.setAttribute('aria-expanded', 'true');
            addDocumentListeners(documentClickHandler);
            active.categoryButtonElement.focus();

            if (isDefault) {
                active.categoryButtonElement.focus();
            } else {
                active.element().children[0].focus();
            }

        },
        close() {
            visible = false;
            onVisibility(visible);

            active = null;
            deactivateAllSubmenus(submenus);

            settingsMenuElement.setAttribute('aria-expanded', 'false');
            settingsMenuElement.focus();
            removeDocumentListeners(documentClickHandler);
        },
        toggle() {
            if (visible) {
                this.close();
            } else {
                this.open();
            }
        },
        addSubmenu(submenu) {
            if (!submenu) {
                return;
            }
            const name = submenu.name;
            submenus[name] = submenu;

            if (submenu.isDefault) {
                prependChild(topbarElement, submenu.categoryButtonElement);
            } else {
                // sharing should always be the last submenu
                const sharingButton = topbarElement.querySelector('.jw-submenu-sharing');
                topbarElement.insertBefore(
                    submenu.categoryButtonElement,
                    sharingButton || closeButton.element()
                );
            }

            settingsMenuElement.appendChild(submenu.element());

            onSubmenuAdded();
        },
        getSubmenu(name) {
            return submenus[name];
        },
        removeSubmenu(name) {
            const submenu = submenus[name];
            if (!submenu) {
                return;
            }
            settingsMenuElement.removeChild(submenu.element());
            topbarElement.removeChild(submenu.categoryButtonElement);
            submenu.destroy();
            delete submenus[name];

            if (!Object.keys(submenus).length) {
                this.close();
                onMenuEmpty();
            }
        },
        activateSubmenu(name) {
            const submenu = submenus[name];
            if (!submenu || submenu.active) {
                return;
            }

            deactivateAllSubmenus(submenus);
            submenu.activate();
            active = submenu;
        },
        activateFirstSubmenu() {
            const firstSubmenuName = Object.keys(submenus)[0];
            this.activateSubmenu(firstSubmenuName);
        },
        element() {
            return settingsMenuElement;
        },
        destroy() {
            this.close();
            settingsMenuElement.removeEventListener('keydown', keyHandler);
            emptyElement(settingsMenuElement);
        }
    };

    Object.defineProperties(instance, {
        visible: {
            enumerable: true,
            get: () => visible
        },
    });

    return instance;
}

const addDocumentListeners = (handler) => {
    document.addEventListener('mouseup', handler);
    document.addEventListener('pointerup', handler);
    document.addEventListener('touchstart', handler);
};

const removeDocumentListeners = (handler) => {
    document.removeEventListener('mouseup', handler);
    document.removeEventListener('pointerup', handler);
    document.removeEventListener('touchstart', handler);
};

const deactivateAllSubmenus = (submenus) => {
    Object.keys(submenus).forEach(name => {
        submenus[name].deactivate();
    });
};
