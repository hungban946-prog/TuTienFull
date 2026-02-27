package me.tutien.full;

import me.tutien.full.cmd.TuTienCommand;
import me.tutien.full.data.DataManager;
import me.tutien.full.gui.MainGui;
import me.tutien.full.system.Tribulation;
import me.tutien.full.util.MM;
import org.bukkit.Bukkit;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.event.*;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.util.List;

public final class TuTienPlugin extends JavaPlugin implements Listener {

  public static final class Cfg {
    public int saveIntervalSec;
    public int expPerTrain;
    public int trainCooldownSec;

    public int breakCooldownSec;
    public double baseFail;
    public double failLosePercent;

    public boolean tribEnabled;
    public int tribStrikes;
    public double tribDamage;

    public String guiTitle;
  }

  private DataManager data;
  private MainGui gui;
  private Tribulation trib;

  private Cfg cfg = new Cfg();
  private YamlConfiguration messages;

  @Override
  public void onEnable() {
    saveDefaultConfig();
    saveResource("messages.yml", false);
    reloadAll();

    this.data = new DataManager(this);
    this.gui = new MainGui(this);
    this.trib = new Tribulation(this);

    var c = getCommand("tutien");
    if (c != null) {
      var exec = new TuTienCommand(this);
      c.setExecutor(exec);
      c.setTabCompleter(exec);
    }

    Bukkit.getPluginManager().registerEvents(this, this);

    // auto save
    Bukkit.getScheduler().runTaskTimerAsynchronously(this, () -> {
      if (data != null) data.saveAll();
    }, 20L * cfg.saveIntervalSec, 20L * cfg.saveIntervalSec);

    getLogger().info("TuTienFull enabled (Paper 1.21.1)");
  }

  @Override
  public void onDisable() {
    if (data != null) data.saveAll();
  }

  public void reloadAll() {
    reloadConfig();
    FileConfiguration c = getConfig();

    File msgFile = new File(getDataFolder(), "messages.yml");
    this.messages = YamlConfiguration.loadConfiguration(msgFile);

    cfg.saveIntervalSec = c.getInt("save-interval-seconds", 60);

    cfg.expPerTrain = c.getInt("cultivation.exp-per-train", 8);
    cfg.trainCooldownSec = c.getInt("cultivation.train-cooldown", 2);

    cfg.breakCooldownSec = c.getInt("breakthrough.cooldown", 10);
    cfg.baseFail = c.getDouble("breakthrough.base-fail", 0.18);
    cfg.failLosePercent = c.getDouble("breakthrough.fail-lose-exp-percent", 0.10);

    cfg.tribEnabled = c.getBoolean("tribulation.enabled", true);
    cfg.tribStrikes = c.getInt("tribulation.lightning-strikes", 5);
    cfg.tribDamage = c.getDouble("tribulation.damage", 3.0);

    cfg.guiTitle = c.getString("gui.title", "<bold>Tu Tiên</bold>");
  }

  public Cfg getCfg() { return cfg; }
  public DataManager data() { return data; }
  public MainGui gui() { return gui; }
  public Tribulation trib() { return trib; }

  public String msg(String key) {
    return messages.getString(key, "");
  }
  public List<String> msgList(String key) {
    return messages.getStringList(key);
  }

  @EventHandler
  public void onJoin(PlayerJoinEvent e) {
    data.get(e.getPlayer().getUniqueId()); // load
  }

  @EventHandler
  public void onQuit(PlayerQuitEvent e) {
    data.unload(e.getPlayer().getUniqueId());
  }

  @EventHandler
  public void onInvClick(InventoryClickEvent e) {
    if (!(e.getWhoClicked() instanceof org.bukkit.entity.Player p)) return;
    if (e.getView().title() == null) return;
    // title compare (mini -> component) khó; check raw by serialize is overkill
    // => cách đơn giản: inventory size + slot items match
    if (e.getInventory().getSize() != 27) return;

    // Nếu click trong GUI tu tiên thì chặn kéo đồ
    // (điều kiện mạnh hơn: title chứa "Tu Tiên")
    String plain = net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer.plainText().serialize(e.getView().title());
    if (!plain.toLowerCase().contains("tu tiên") && !plain.toLowerCase().contains("tu tien")) return;

    e.setCancelled(true);

    if (e.getRawSlot() == 11) {
      p.performCommand("tutien tu");
    } else if (e.getRawSlot() == 15) {
      p.performCommand("tutien dotpha");
    } else if (e.getRawSlot() == 13) {
      p.performCommand("tutien info");
    }
  }
}
