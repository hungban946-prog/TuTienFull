package me.tutien.full;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.attribute.Attribute;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.HashMap;
import java.util.UUID;

public class TuTienPlugin extends JavaPlugin {

    private final HashMap<UUID, Integer> cultivation = new HashMap<>();

    @Override
    public void onEnable() {
        getLogger().info("TuTienFull da bat!");
    }

    @Override
    public void onDisable() {
        getLogger().info("TuTienFull da tat!");
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {

        if (!(sender instanceof Player player)) return true;

        if (command.getName().equalsIgnoreCase("tutien")) {

            cultivation.putIfAbsent(player.getUniqueId(), 0);

            int power = cultivation.get(player.getUniqueId());
            power += 10;

            cultivation.put(player.getUniqueId(), power);

            player.sendMessage(ChatColor.GREEN + "Tu vi cua ban: " + power);

            player.getAttribute(Attribute.GENERIC_MAX_HEALTH)
                    .setBaseValue(20 + (power / 50.0));

            return true;
        }

        return false;
    }
}
