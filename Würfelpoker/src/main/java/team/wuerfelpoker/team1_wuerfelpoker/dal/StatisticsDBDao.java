package team.wuerfelpoker.team1_wuerfelpoker.dal;

import java.util.List;

public class StatisticsDBDao implements Dao<Statistic>{
    @Override
    public List<Statistic> getAllStatistics() {
        return DBManager.getInstance().getAllStatistics();
    }

    @Override
    public Statistic getLastStatistic() {
        return DBManager.getInstance().getLastStatistic();
    }

    @Override
    public void insert(Statistic statistic) {
        DBManager.getInstance().insertStatistic(statistic);
    }
}
