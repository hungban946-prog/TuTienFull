package me.tutien.full.system;

public final class Progression {
  private Progression() {}

  // Need exp theo (realmIndex, layer)
  public static int expNeed(Realm realm, int layer) {
    int ri = realm.ordinal();          // 0..7
    int base = 120 + ri * 90;          // tăng theo cảnh giới
    int layerMul = 1 + (layer - 1);    // tầng cao cần nhiều hơn
    return base * layerMul;
  }

  // “Tu vi” (power) dùng để top / scale
  public static long power(Realm realm, int layer, int exp) {
    long ri = realm.ordinal() + 1L;
    long p = ri * 1000L + layer * 120L + (exp / 5L);
    return Math.max(0, p);
  }

  public static double failChanceBase(double baseFail, Realm realm, int layer, int exp, int need) {
    // exp càng gần full thì fail giảm
    double fill = need <= 0 ? 0 : Math.min(1.0, exp / (double) need);
    double realmHard = realm.ordinal() * 0.01;      // cảnh giới cao khó hơn 1 chút
    double layerHard = (layer - 1) * 0.005;
    double chance = baseFail + realmHard + layerHard - (fill * 0.12);
    // clamp 2%..65%
    if (chance < 0.02) chance = 0.02;
    if (chance > 0.65) chance = 0.65;
    return chance;
  }
}
