const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class SetAdminRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setadminrole',
      aliases: ['setar', 'sar'],
      usage: 'setadminrole <role mention | role name>',
      description: 'Sets the admin role for your server. Provide no role to clear the current admin role.',
      type: 'admin',
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setadminrole @Admin']
    });
  }
  run(message, args) {
    const adminRoleId = message.client.db.guildSettings.selectAdminRoleId.pluck().get(message.guild.id);
    let oldRole = message.guild.roles.cache.find(r => r.id === adminRoleId) || '`None`';

    const embed = new MessageEmbed()
      .setTitle('Server Settings')
      .addField('Setting', '**Admin Role**', true)
      .setThumbnail(message.guild.iconURL())
      .setFooter(`
        Requested by ${message.member.displayName}#${message.author.discriminator}`, message.author.displayAvatarURL()
      )
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);

    // Clear if no args provided
    if (args.length === 0) {
      message.client.db.guildSettings.updateAdminRoleId.run(null, message.guild.id);
      return message.channel.send(embed.addField('Current Role', `${oldRole} 🡪 \`None\``, true));
    }

    // Update role
    const roleName = args.join(' ').toLowerCase();
    let role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
    role = this.getRoleFromMention(message, args[0]) || role;
    if (!role) return this.sendErrorMessage(message, 'Invalid argument. Please mention a role or provide a role name.');
    message.client.db.guildSettings.updateAdminRoleId.run(role.id, message.guild.id);
    message.channel.send(embed.addField('Current Role', `${oldRole} 🡪 ${role}`, true));
  }
};
