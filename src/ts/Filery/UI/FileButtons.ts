import {Control} from './Control';
import {File} from '../Model/File';
import {PluginConfig} from '../Plugin';
import {ApiClient} from '../ApiClient';

declare var tinymce: any;

export class FileButtons extends Control {

    protected file: File;

    private readonly config: PluginConfig;

    constructor(file: File, config: PluginConfig) {
        super();

        this.file = file;

        this.config = config;

        this.element = Control.createElement('div', {
            className: 'file-buttons',
        });

        let menu = Control.createByTag('ul');

        if (this.config.type === 'select') {
            menu.append(Control.createByTag('li')
                .text(tinymce.i18n.translate('Select'))
                .on('click', (e) => {
                    e.preventDefault();
                    this.insertFile('select');
                }));
        } else {
            menu.append(Control.createByTag('li')
                .text(tinymce.i18n.translate('Insert link'))
                .on('click', (e) => {
                    e.preventDefault();
                    this.insertFile('link');
                }));

            if (this.file.getType() === 'image') {
                menu.append(Control.createByTag('li')
                    .text(tinymce.i18n.translate('Insert image'))
                    .on('click', (e) => {
                        e.preventDefault();
                        this.insertFile('image');
                    }));
            }
        }

        menu
            .append(Control.createByTag('li')
                .text(tinymce.i18n.translate('Delete'))
                .on('click', (e) => {
                    e.preventDefault();
                    this.deleteFile();
                }));

        this.append(menu);
    }

    public show() {
        this
            .addClass('show')
            .trigger('showed', [this]);
    }

    public hide() {
        this
            .removeClass('show')
            .trigger('hidden', [this]);
    }

    public toggleShow() {
        if (this.hasClass('show')) {
            this.hide();
        } else {
            this.show();
        }
    }

    private insertFile(type: string): this {
        if (this.config.callback(this.file, type)) {
            this.config.editor.windowManager.close(window);

            let text = tinymce.i18n.translate(['"{0}" as link successfully inserted.', this.file.getName()]);
            if (type === 'image') {
                text = tinymce.i18n.translate(['"{0}" as image successfully inserted.', this.file.getName()]);
            }

            this.config.editor.notificationManager.open({
                text: text,
                type: 'success',
                timeout: 3000
            });

            return this;
        } else {
            console.error('Insert callback failed (or returned false/null).');
        }
        return this;
    }


    public deleteFile(): this {
        this.config.editor.windowManager.confirm(tinymce.i18n.translate(['Are you sure you want to delete "{0}"?', this.file.getName()]), (state) => {
            if (state) {
                ApiClient
                    .delete(this.file)
                    .then(() => {
                        this.element.parentElement.remove();
                        /*this.fadeOut(() => {

                            this.deselect();
                            this.loadDialogContent();
                            this.editor.windowManager.alert(tinymce.i18n.translate(['"{0}" successfully deleted.', file.getName()]));
*/
                        /*this.editor.windowManager.confirm(tinymce.i18n.translate(['"{0}" successfully deleted. Do you want to remove the content with reference to the deleted file?', file.getName()]), (state) => {
                            if (state) {
                                Control
                                    .createBySelector('img', this.editor.getBody())
                                    .forEach((img) => {
                                        if (img.getAttribute('src').endsWith(file.getName())) {
                                            img.remove();
                                        }
                                    });

                                Control
                                    .createBySelector('a', this.editor.getBody())
                                    .forEach((a) => {
                                        if (a.getAttribute('href').endsWith(file.getName())) {
                                            a.unwrap();
                                        }
                                    });
                            }
                        });*/
                        /* }, 30);*/

                    })
                    .catch((error) => {
                        this.config.editor.windowManager.alert(tinymce.i18n.translate(['Delete failed: {0}', error]));
                    });
            } else {
                //  this.selectedItem.unselect();
            }

        });

        return this;
    }

}

