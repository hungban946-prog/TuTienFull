package me.tutien.full.cmd;

import me.tutien.full.TuTienPlugin;
import me.tutien.full.data.PlayerData;
import me.tutien.full.system.Progression;
import me.tutien.full.system.Realm;
import me.tutien.full.util.MM;
import me.tutien.full.util.TimeUtil;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.command.*;
import org.bukkit.entity.Player;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class TuTienCommand implements CommandExecutor, TabCompleter {
  private final TuTienPlugin plugin;

  public TuTienCommand(TuTienPlugin plugin) {
    this.plugin = plugin;
  }

  @Override
  public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
    if (!(sender instanceof Player p)) {
      sender.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("player-only")));
      return true;
    }

    if (args.length == 0) {
      plugin.gui().open(p);
      return true;
    }

    String sub = args[0].toLowerCase();

    switch (sub) {
      case "help" -> {
        for (String line : plugin.msgList("help")) p.sendMessage(MM.c(plugin.msg("prefix") + line));
        return true;
      }
      case "info" -> {
        PlayerData d = plugin.data().get(p.getUniqueId());
        long trainLeft = TimeUtil.secLeft(d.trainCooldownUntil);
        long breakLeft = TimeUtil.secLeft(d.breakCooldownUntil);
        for (String line : plugin.msgList("info")) {
          String out = line
              .replace("{realm}", d.realm.display)
              .replace("{layer}", String.valueOf(d.layer))
              .replace("{exp}", String.valueOf(d.exp))
              .replace("{need}", String.valueOf(d.need()))
              .replace("{power}", String.valueOf(d.power()))
              .replace("{traincd}", String.valueOf(trainLeft))
              .replace("{breakcd}", String.valueOf(breakLeft));
          p.sendMessage(MM.c(plugin.msg("prefix") + out));
        }
        return true;
      }
      case "tu", "train" -> {
        PlayerData d = plugin.data().get(p.getUniqueId());
        long left = TimeUtil.secLeft(d.trainCooldownUntil);
        if (left > 0) {
          p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("train-cd").replace("{sec}", String.valueOf(left))));
          return true;
        }

        int add = plugin.getCfg().expPerTrain;
        int need = d.need();
        d.exp = Math.min(need, d.exp + add);

        d.trainCooldownUntil = TimeUtil.now() + plugin.getCfg().trainCooldownSec * 1000L;

        p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("trained")
            .replace("{exp}", String.valueOf(add))
            .replace("{now}", String.valueOf(d.exp))
            .replace("{need}", String.valueOf(need))
        ));
        return true;
      }
      case "dotpha", "break" -> {
        PlayerData d = plugin.data().get(p.getUniqueId());
        long left = TimeUtil.secLeft(d.breakCooldownUntil);
        if (left > 0) {
          p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("break-cd").replace("{sec}", String.valueOf(left))));
          return true;
        }

        int need = d.need();
        if (d.exp < need) {
          double fail = Progression.failChanceBase(plugin.getCfg().baseFail, d.realm, d.layer, d.exp, need);
          int pct = (int) Math.round(fail * 100);
          p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("break-ready")
              .replace("{now}", String.valueOf(d.exp))
              .replace("{need}", String.valueOf(need))
              .replace("{fail}", String.valueOf(pct))
          ));
          return true;
        }

        // roll
        double fail = Progression.failChanceBase(plugin.getCfg().baseFail, d.realm, d.layer, d.exp, need);
        boolean isFail = Math.random() < fail;

        d.breakCooldownUntil = TimeUtil.now() + plugin.getCfg().breakCooldownSec * 1000L;

        if (isFail) {
          int lose = (int) Math.ceil(need * plugin.getCfg().failLosePercent);
          d.exp = Math.max(0, d.exp - lose);
          p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("break-fail").replace("{lose}", String.valueOf(lose))));
          return true;
        }

        String old = d.realm.display + " Tầng " + d.layer;

        // success -> tăng tầng; max tầng thì lên cảnh giới, reset tầng
        d.exp = 0;
        if (d.layer < d.realm.maxLayer) {
          d.layer++;
        } else {
          if (d.realm.ordinal() < Realm.values().length - 1) {
            d.realm = Realm.values()[d.realm.ordinal() + 1];
            d.layer = 1;
            plugin.trib().run(p);
          } else {
            // max max
            d.layer = d.realm.maxLayer;
          }
        }

        String neu = d.realm.display + " Tầng " + d.layer;

        p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("break-success")
            .replace("{old}", old)
            .replace("{new}", neu)
        ));
        return true;
      }
      case "top" -> {
        var top = plugin.data().top(10);
        p.sendMessage(MM.c(plugin.msg("prefix") + "<gold><bold>Top Tu Vi</bold></gold>"));
        int i = 1;
        for (Map.Entry<UUID, PlayerData> e : top) {
          OfflinePlayer op = Bukkit.getOfflinePlayer(e.getKey());
          PlayerData d = e.getValue();
          p.sendMessage(MM.c("<gray>#"+i+"</gray> <white>"+ op.getName() +"</white> <dark_gray>-</dark_gray> <green>"+ d.power() +"</green> <gray>("+d.realm.display+" "+d.layer+")</gray>"));
          i++;
        }
        return true;
      }
      case "admin" -> {
        if (!p.hasPermission("tutien.admin")) {
          p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("no-permission")));
          return true;
        }
        if (args.length >= 2 && args[1].equalsIgnoreCase("reload")) {
          plugin.reloadAll();
          p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("reloaded")));
          return true;
        }
        if (args.length >= 6 && args[1].equalsIgnoreCase("set")) {
          String targetName = args[2];
          Realm realm = Realm.parse(args[3]);
          if (realm == null) {
            p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("unknown-realm")));
            return true;
          }
          int layer = safeInt(args[4], 1);
          int exp = safeInt(args[5], 0);
          if (layer < 1) layer = 1;
          if (layer > realm.maxLayer) layer = realm.maxLayer;

          Player target = Bukkit.getPlayerExact(targetName);
          OfflinePlayer off = target != null ? target : Bukkit.getOfflinePlayer(targetName);

          var d = plugin.data().get(off.getUniqueId());
          d.realm = realm;
          d.layer = layer;
          d.exp = Math.max(0, Math.min(d.need(), exp));

          if (target != null) {
            target.sendMessage(MM.c(plugin.msg("prefix") + "<yellow>Admin set tu vi cho m.</yellow>"));
          }
          p.sendMessage(MM.c(plugin.msg("prefix") + plugin.msg("admin-set").replace("{player}", off.getName() == null ? targetName : off.getName())));
          return true;
        }

        p.sendMessage(MM.c(plugin.msg("prefix") + "<red>Dùng:</red> /tutien admin reload | /tutien admin set <player> <realm> <layer> <exp>"));
        return true;
      }
      default -> {
        for (String line : plugin.msgList("help")) p.sendMessage(MM.c(plugin.msg("prefix") + line));
        return true;
      }
    }
  }

  private int safeInt(String s, int def) {
    try { return Integer.parseInt(s); } catch (Exception e) { return def; }
  }

  @Override
  public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
    if (args.length == 1) return List.of("info","tu","dotpha","top","admin","help");
    if (args.length == 2 && args[0].equalsIgnoreCase("admin")) return List.of("reload","set");
    if (args.length == 4 && args[0].equalsIgnoreCase("admin") && args[1].equalsIgnoreCase("set")) {
      return java.util.Arrays.stream(Realm.values()).map(Enum::name).toList();
    }
    return List.of();
  }
              }
