package me.tutien.full.gui;

import me.tutien.full.TuTienPlugin;
import me.tutien.full.data.PlayerData;
import me.tutien.full.util.MM;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.entity.Player;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

import java.util.List;

public final class MainGui {
  private final TuTienPlugin plugin;

  public MainGui(TuTienPlugin plugin) {
    this.plugin = plugin;
  }

  public void open(Player p) {
    PlayerData d = plugin.data().get(p.getUniqueId());
    Inventory inv = Bukkit.createInventory(null, 27, MM.c(plugin.getCfg().guiTitle));

    inv.setItem(11, item(Material.EXPERIENCE_BOTTLE,
        "<green><bold>Tu luyện</bold></green>",
        List.of(
            "<gray>Nhận EXP tu luyện</gray>",
            "<yellow>EXP:</yellow> <white>" + d.exp + "</white><gray>/</gray><white>" + d.need() + "</white>",
            "<gray>Click để tu luyện</gray>"
        )));

    inv.setItem(13, item(Material.NETHER_STAR,
        "<aqua><bold>Thông tin</bold></aqua>",
        List.of(
            "<yellow>Cảnh giới:</yellow> <aqua>" + d.realm.display + "</aqua> <gray>Tầng</gray> <white>" + d.layer + "</white>",
            "<yellow>Tu vi:</yellow> <green>" + d.power() + "</green>"
        )));

    inv.setItem(15, item(Material.ENCHANTED_BOOK,
        "<gold><bold>Đột phá</bold></gold>",
        List.of(
            "<gray>Đột phá lên tầng/cảnh giới mới</gray>",
            "<yellow>Yêu cầu:</yellow> <white>EXP đầy</white>",
            "<gray>Click để đột phá</gray>"
        )));

    p.openInventory(inv);
    p.playSound(p.getLocation(), Sound.UI_BUTTON_CLICK, 1f, 1.2f);
  }

  private ItemStack item(Material m, String name, List<String> lore) {
    ItemStack it = new ItemStack(m);
    ItemMeta meta = it.getItemMeta();
    meta.displayName(MM.c(name));
    meta.lore(lore.stream().map(MM::c).toList());
    it.setItemMeta(meta);
    return it;
  }
}
