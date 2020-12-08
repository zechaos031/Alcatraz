//  ______   __                      __
// /      \ |  \                    |  \
//|  $$$$$$\| $$  _______  ______  _| $$_     ______   ______   ________
//| $$__| $$| $$ /       \|      \|   $$ \   /      \ |      \ |        \
//| $$    $$| $$|  $$$$$$$ \$$$$$$\\$$$$$$  |  $$$$$$\ \$$$$$$\ \$$$$$$$$
//| $$$$$$$$| $$| $$      /      $$ | $$ __ | $$   \$$/      $$  /    $$
//| $$  | $$| $$| $$_____|  $$$$$$$ | $$|  \| $$     |  $$$$$$$ /  $$$$_
//| $$  | $$| $$ \$$     \\$$    $$  \$$  $$| $$      \$$    $$|  $$    \
// \$$   \$$ \$$  \$$$$$$$ \$$$$$$$   \$$$$  \$$       \$$$$$$$ \$$$$$$$$
//=======================================================================
//● Crée par GalackQSM#0895 le 09 novembre 2020
//● Serveur Discord: https://discord.gg/HPtTfqDdMr
//● Github: https://github.com/GalackQSM/Alcatraz
//=======================================================================

const {Client,Collection} = require('discord.js'),
     { readdir, readdirSync } = require('fs'),
     { join, resolve } = require('path'),
     AsciiTable = require('ascii-table'),
     { fail } = require('./utils/emojis.json');

class Alcatraz extends Client {
    constructor(config, options = {}) {
        super(options);
        this.logger = require('./utils/logger.js');
        this.db = require('./utils/db.js');
        this.config = config;
        this.types = {
            INFO: 'Informations',
            FUN: 'Fun',
            COULEUR: 'Couleurs',
            POINTS: 'Points',
            GENERAL: 'Général',
            NFSW: 'NFSW',
            JEUX: 'Jeux',
            AVATAR: 'Avatar',
            BACKUP: 'Backup',
            MOD: 'Modération',
            ADMIN: 'Administration',
            OWNER: 'Propriétaire'
        };
        this.commands = new Collection();
        this.aliases = new Collection();
        this.topics = [];
        this.token = config.token;
        this.apiKeys = config.apiKeys;
        this.ownerId = config.ownerId;
        this.bugReportChannelId = config.bugReportChannelId;
        this.feedbackChannelId = config.feedbackChannelId;
        this.serverLogId = config.serverLogId;
        this.utils = require('./utils/utils.js');
        this.logger.info('Initialisation...');

    }

    loadEvents(path) {
        readdir(path, (err, files) => {
            if (err) this.logger.error(err);
            files = files.filter(f => f.split('.').pop() === 'js');
            if (files.length === 0) return this.logger.warn('Aucun événement trouvé');
            this.logger.info(`${files.length} événement(s) trouvé(s)...`);
            files.forEach(f => {
                const eventName = f.substring(0, f.indexOf('.'));
                const event = require(resolve(__basedir, join(path, f)));
                super.on(eventName, event.bind(null, this));
                delete require.cache[require.resolve(resolve(__basedir, join(path, f)))];
                this.logger.info(`Chargement de l'évenement: ${eventName}`);
            });
        });
        return this;
    }

    loadCommands(path) {
        this.logger.info('Chargement des commandes...');
        let table = new AsciiTable('Commandes');
        table.setHeading('Fichiers', 'Aliases', 'Catégories', 'Statut');
        readdirSync(path).filter(f => !f.endsWith('.js')).forEach(dir => {
            const commands = readdirSync(resolve(__basedir, join(path, dir))).filter(f => f.endsWith('js'));
            commands.forEach(f => {
                const Command = require(resolve(__basedir, join(path, dir, f)));
                const command = new Command(this);
                if (command.name && !command.disabled) {
                    this.commands.set(command.name, command);
                    let aliases = '';
                    if (command.aliases) {
                        command.aliases.forEach(alias => {
                            this.aliases.set(alias, command);
                        });
                        aliases = command.aliases.join(', ');
                    }
                    table.addRow(f, aliases, command.type, 'pass');
                } else {
                    this.logger.warn(`${f} échec du chargement`);
                    table.addRow(f, '', '', 'fail');

                }
            });
        });
        this.logger.info(`\n${table.toString()}`);
        return this;
    }

    isOwner(user) {
        return user.id === this.ownerId;
    }

    sendSystemErrorMessage(guild, error, errorMessage) {

        const systemChannelId = this.db.settings.selectSystemChannelId.pluck().get(guild.id);
        const systemChannel = guild.channels.cache.get(systemChannelId);

        if (
            !systemChannel ||
            !systemChannel.viewable ||
            !systemChannel.permissionsFor(guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {

            systemChannel.send({
                embed: {
                    author: {
                        name: this.user.tag,
                        icon_url: this.user.displayAvatarURL({dynamic: true})
                    },
                    title: `${fail} Erreur système: \`${error}\``,
                    description: `\`\`\`diff\n- Défaillance du système\n+ ${errorMessage}\`\`\``,
                    timestamp: new Date(),
                    color: guild.me.displayHexColor
                }
            })

        }
    }
}

module.exports = Alcatraz;
