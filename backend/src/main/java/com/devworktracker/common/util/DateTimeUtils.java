package com.devworktracker.common.util;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public final class DateTimeUtils {

    public static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    public static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private DateTimeUtils() {
    }

    public static ZonedDateTime toAppZoned(Instant instant) {
        if (instant == null) {
            return null;
        }
        return instant.atZone(APP_ZONE);
    }

    public static String formatIso(Instant instant) {
        if (instant == null) {
            return null;
        }
        return toAppZoned(instant).format(ISO_FORMATTER);
    }
}

