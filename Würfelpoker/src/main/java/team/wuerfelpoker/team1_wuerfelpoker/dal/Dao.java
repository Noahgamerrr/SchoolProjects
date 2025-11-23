package team.wuerfelpoker.team1_wuerfelpoker.dal;

import java.util.List;

public interface Dao<T> {
    List<T> getAllStatistics();
    T getLastStatistic();
    void insert(T statistic);
}
