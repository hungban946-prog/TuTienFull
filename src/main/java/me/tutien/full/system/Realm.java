package me.tutien.full.system;

import java.util.Arrays;

public enum Realm {
  LUYEN_KHI("Luyện Khí", 9),
  TRUC_CO("Trúc Cơ", 9),
  KIM_DAN("Kim Đan", 9),
  NGUYEN_ANH("Nguyên Anh", 9),
  HOA_THAN("Hóa Thần", 9),
  LUYEN_HU("Luyện Hư", 9),
  HOP_THE("Hợp Thể", 9),
  DAI_THUA("Đại Thừa", 9);

  public final String display;
  public final int maxLayer;

  Realm(String display, int maxLayer) {
    this.display = display;
    this.maxLayer = maxLayer;
  }

  public static Realm parse(String s) {
    if (s == null) return null;
    String t = s.trim().toUpperCase().replace(' ', '_');
    return Arrays.stream(values()).filter(r -> r.name().equals(t)).findFirst().orElse(null);
  }
}
