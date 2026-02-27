package me.tutien.full.system;

import me.tutien.full.TuTienPlugin;
import me.tutien.full.util.MM;
import org.bukkit.Location;
import org.bukkit.Sound;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitRunnable;

public final class Tribulation {
  private final TuTienPlugin plugin;

  public Tribulation(TuTienPlugin plugin) {
    this.plugin = plugin;
  }

  public void run(Player p) {
    if (!plugin.getCfg().tribEnabled) return;

    p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("tribulation")));
    p.playSound(p.getLocation(), Sound.ENTITY_WITHER_SPAWN, 1f, 0.6f);

    int strikes = plugin.getCfg().tribStrikes;
    double dmg = plugin.getCfg().tribDamage;

    new BukkitRunnable() {
      int i = 0;
      @Override public void run() {
        if (!p.isOnline() || p.isDead()) { cancel(); return; }
        if (i >= strikes) { cancel(); return; }
        i++;

        Location loc = p.getLocation();
        loc.getWorld().strikeLightningEffect(loc);
        p.damage(dmg);
        p.playSound(loc, Sound.ENTITY_LIGHTNING_BOLT_THUNDER, 1f, 1f);
      }
    }.runTaskTimer(plugin, 10L, 14L);
  }
}
