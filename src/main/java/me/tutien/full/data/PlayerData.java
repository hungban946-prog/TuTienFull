package me.tutien.full.data;

import me.tutien.full.system.Progression;
import me.tutien.full.system.Realm;

public final class PlayerData {
  public Realm realm = Realm.LUYEN_KHI;
  public int layer = 1;
  public int exp = 0;

  public long trainCooldownUntil = 0L;
  public long breakCooldownUntil = 0L;

  public int need() { return Progression.expNeed(realm, layer); }
  public long power() { return Progression.power(realm, layer, exp); }
}
