package spr.util;

import java.util.Comparator;

import dave.util.Producer;

public interface ConsecutiveProducer<T> extends Producer<T>, Comparator<T>
{
}
