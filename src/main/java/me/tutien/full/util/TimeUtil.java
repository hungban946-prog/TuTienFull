package me.tutien.full.util;

public final class TimeUtil {
  private TimeUtil() {}
  public static long now() { return System.currentTimeMillis(); }
  public static long secLeft(long untilMs) {
    long left = untilMs - now();
    if (left <= 0) return 0;
    return (long) Math.ceil(left / 1000.0);
  }
}
