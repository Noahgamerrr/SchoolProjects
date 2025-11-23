package team.wuerfelpoker.team1_wuerfelpoker;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

public class DieCalculations {
	private static final double HIGHEST_POSSIBLE = 100; // the highest possible value to achieve if you add all the die values together + 1; shouldn't be too high to circumvent floating point inaccuracy

	private DieCalculations() {
	}

	public record DieRecord(String name, double value) {
	}

	public enum Patterns {
		// TODO make the pattern actually do something :/
		HIGH_CARD(0, ""), PAIR(1, "aa"), DOUBLE_PAIR(2, "aabb"), THREE_OF_A_KIND(3, "aaa"), FOUR_OF_A_KIND(6, "aaaa"),
		FIVE_OF_A_KIND(7, "aaaaa"), STRAIGHT(4, "abcde", 5), FULL_HOUSE(5, "aaabb");
		final int value;
		final String pattern;
		final int straight; // -1 if it doesnt matter

		Patterns(int value, String pattern) {
			this.value = value;
			this.pattern = pattern;
			this.straight = -1;
		}
		Patterns(int value, String pattern, int straight) {
			this.value = value;
			this.pattern = pattern;
			this.straight = straight;
		}

		boolean hasMultipleMultiples(Collection<Integer> values) {
			Vector<Integer> v = new Vector(5);
			values.stream().sorted().reduce((v1, v2) -> {
				if (v1.equals(v2)) v.add(v2);
				return v2;
			});
			return v.stream().distinct().toList().size() > 1;
		}

		static Patterns search(Collection<Integer> values) {
			Map<Integer, Integer> integers = new HashMap<>(values.stream().max(Integer::compareTo).orElse(0) + 1);
			for (var value : values) {
				integers.put(value, integers.getOrDefault(value, 0) + 1);
			}
			Map<Patterns, Map<Character, Integer>> patternsMap = new HashMap<>();
			for (var pattern : Patterns.values()) {
				var a = pattern.pattern.toCharArray();
				Map<Character, Integer> characterIntegerMap = new HashMap<>();
				for (char c : a) {
					characterIntegerMap.put(c, characterIntegerMap.getOrDefault(c, 0) + 1);
				}
				patternsMap.put(pattern, characterIntegerMap);
			}
			return patternsMap.entrySet().stream().filter(entry -> {
				PriorityQueue<Integer> queue = new PriorityQueue<>(Comparator.reverseOrder());
				queue.addAll(integers.values());

				AtomicBoolean atomicBoolean = new AtomicBoolean(true);
				entry.getValue().values().stream().sorted(Comparator.reverseOrder()).forEach(val -> {
					atomicBoolean.compareAndExchange(true, queue.peek() != null && queue.poll() >= val);
				});
				return atomicBoolean.get() && (!(entry.getKey().straight > 0) || isStraight(values, entry.getKey().straight));
			}).map(Map.Entry::getKey).max(Comparator.comparingInt(v -> v.value)).orElse(HIGH_CARD);

		}

		private static boolean isStraight(Collection<Integer> values, int amountOfSequentialNumbers) {
			var i = new AtomicInteger(0);
			var b = new AtomicBoolean(false);
			values.stream().sorted().reduce((v1, v2) -> {
				if (Integer.valueOf(v1 + 1).equals(v2)) i.getAndIncrement();
				else i.set(0);
				if(i.get() >= amountOfSequentialNumbers - 1)
					b.set(true);
				return v2;
			});
			return b.get();
		}

		static Patterns of(double value) {
			return Arrays.stream(Patterns.values()).filter(p -> p.value == Math.floor(value)).findFirst().get();
		}

		@Override
		public String toString() {
			return this.name().replace("_", " ").toLowerCase();
		}
	}

	public static int getMostUsed(Collection<Integer> values) {
		int h = -1;
		int i = 0;
		for (int v : values) {
			int x = values.stream().filter(v1 -> v1.equals(v)).toList().size();
			if (x > h) {
				h = x;
				i = v;
			}
			;
		}
		return i;
	}

	public static int getSecondToMostUsed(Collection<Integer> values) {
		return getMostUsed(values.stream().filter(v -> getMostUsed(values) != v).toList());
	}

	public static double getValue(Collection<Integer> values) {
		var v = Patterns.search(values);
		return values.stream().reduce(Integer::sum).get().doubleValue() / HIGHEST_POSSIBLE + (v != null ? v.value : 0);
	}


	public static DieRecord getData(Collection<Integer> values) {
		var pattern = Patterns.search(values);
		String s;
		if (pattern == Patterns.FULL_HOUSE || pattern == Patterns.DOUBLE_PAIR) {
			s = " of %s and %s".formatted(getMostUsed(values), getSecondToMostUsed(values));
		} else if (pattern == Patterns.STRAIGHT || pattern == Patterns.HIGH_CARD) {
			s = " of %s".formatted(values.stream().max(Integer::compare).get());
		} else {
			s = " of %s".formatted(getMostUsed(values));
		}
		return new DieRecord((pattern != null ? pattern.toString() : "") + s, getValue(values));
	}

	public static DieRecord getData(Integer... values) {
		return getData(Arrays.stream(values).toList());
	}
}
