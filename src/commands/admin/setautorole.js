const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

module.exports = class SetAutoRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setautorole',
      aliases: ['setaur', 'saur'],
      usage: 'setautorole <role mention | role name>',
      description: oneLine`
        Sets the role all new members will receive upon joining your server.
        Provide no role to clear the current auto role.
      `,
      type: 'admin',
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setautorole @Member']
    });
  }
  run(message, args) {
    const autoRoleId = message.client.db.guildSettings.selectAutoRoleId.pluck().get(message.guild.id);
    let oldRole = message.guild.roles.cache.find(r => r.id === autoRoleId) || '`None`';

    const embed = new MessageEmbed()
      .setTitle('Server Settings')
      .addField('Setting', '**Auto Role**', true)
      .setThumbnail(message.guild.iconURL())
      .setFooter(`
        Requested by ${message.member.displayName}#${message.author.discriminator}`, message.author.displayAvatarURL()
      )
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);

    // Clear if no args provided
    if (args.length === 0) {
      message.client.db.guildSettings.updateAutoRoleId.run(null, message.guild.id);
      return message.channel.send(embed.addField('Current Role', `${oldRole} 🡪 \`None\``, true));
    }

    // Update role
    const roleName = args.join(' ').toLowerCase();
    let role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
    role = this.getRoleFromMention(message, args[0]) || role;
    if (!role) return this.sendErrorMessage(message, 'Invalid argument. Please mention a role or provide a role name.');
    message.client.db.guildSettings.updateAutoRoleId.run(role.id, message.guild.id);
    message.channel.send(embed.addField('Current Role', `${oldRole} 🡪 ${role}`, true));
  }
};
