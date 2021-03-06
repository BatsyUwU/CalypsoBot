const scheduleCrown = require('../utils/scheduleCrown.js');

module.exports = (client) => {
  
  // Update presence
  client.user.setPresence({ status: 'online', activity: { name: 'your commands', type: 'LISTENING'} });

  // Update db with new servers
  client.logger.info('Updating database and scheduling jobs...');
  client.guilds.cache.forEach(guild => {
    client.db.guildSettings.insertRow.run(guild.id, guild.name, guild.systemChannelID);

    // Schedule crown role rotation
    scheduleCrown(client, guild);

    // Update points table
    guild.members.cache.forEach(member => {
      client.db.guildPoints.insertRow.run(member.id, member.user.username, guild.id, guild.name);
    });
  });

  client.logger.info('Calypso is now online');
  client.logger.info(`Calypso is running on ${client.guilds.cache.size} server(s)`);
};
