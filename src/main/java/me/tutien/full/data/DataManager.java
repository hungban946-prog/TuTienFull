package me.tutien.full.data;

import me.tutien.full.TuTienPlugin;
import me.tutien.full.system.Realm;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public final class DataManager {
  private final TuTienPlugin plugin;
  private final File dir;
  private final Map<UUID, PlayerData> cache = new ConcurrentHashMap<>();

  public DataManager(TuTienPlugin plugin) {
    this.plugin = plugin;
    this.dir = new File(plugin.getDataFolder(), "playerdata");
    if (!dir.exists()) dir.mkdirs();
  }

  public PlayerData get(UUID uuid) {
    return cache.computeIfAbsent(uuid, this::load);
  }

  private PlayerData load(UUID uuid) {
    File f = file(uuid);
    PlayerData d = new PlayerData();
    if (!f.exists()) return d;

    YamlConfiguration y = YamlConfiguration.loadConfiguration(f);
    d.realm = Realm.parse(y.getString("realm"));
    if (d.realm == null) d.realm = Realm.LUYEN_KHI;
    d.layer = Math.max(1, y.getInt("layer", 1));
    d.exp = Math.max(0, y.getInt("exp", 0));
    d.trainCooldownUntil = y.getLong("cd.train", 0L);
    d.breakCooldownUntil = y.getLong("cd.break", 0L);
    // clamp layer
    if (d.layer > d.realm.maxLayer) d.layer = d.realm.maxLayer;
    return d;
  }

  public void save(UUID uuid) {
    PlayerData d = cache.get(uuid);
    if (d == null) return;

    File f = file(uuid);
    YamlConfiguration y = new YamlConfiguration();
    y.set("realm", d.realm.name());
    y.set("layer", d.layer);
    y.set("exp", d.exp);
    y.set("cd.train", d.trainCooldownUntil);
    y.set("cd.break", d.breakCooldownUntil);

    try { y.save(f); } catch (IOException e) { plugin.getLogger().warning("Save fail " + uuid + ": " + e.getMessage()); }
  }

  public void saveAll() {
    for (UUID u : new ArrayList<>(cache.keySet())) save(u);
  }

  public void unload(UUID uuid) {
    save(uuid);
    cache.remove(uuid);
  }

  public List<Map.Entry<UUID, PlayerData>> top(int n) {
    List<Map.Entry<UUID, PlayerData>> list = new ArrayList<>(cache.entrySet());
    list.sort((a,b) -> Long.compare(b.getValue().power(), a.getValue().power()));
    if (list.size() > n) return list.subList(0, n);
    return list;
  }

  private File file(UUID uuid) {
    return new File(dir, uuid.toString() + ".yml");
  }
}
