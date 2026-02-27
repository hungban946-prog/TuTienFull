package me.tutien.full.util;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;

public final class MM {
  private static final MiniMessage MM = MiniMessage.miniMessage();
  private MM() {}

  public static Component c(String mini) {
    return MM.deserialize(mini == null ? "" : mini);
  }
}
