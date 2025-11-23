package team.wuerfelpoker.team1_wuerfelpoker.util;

import team.wuerfelpoker.team1_wuerfelpoker.dal.Statistic;
import team.wuerfelpoker.team1_wuerfelpoker.dal.StatisticsDBDao;

public class SaveManager {
    StatisticsDBDao statisticsDBDao = new StatisticsDBDao();
    Statistic statistic = new Statistic();

    public SaveManager(Statistic statistic) {
        this.statistic = statistic;
    }

    public SaveManager(){}

    public void setStatistic(Statistic statistic) {
        this.statistic = statistic;
    }

    public void setDicesPlayer(int[] dicesPlayer) {this.statistic.setDicesPlayer(dicesPlayer);}

    public void setCardsPlayer(String[] cardsPlayer) {this.statistic.setCardsPlayer(cardsPlayer);}

    public void setRound(int round) {
        this.statistic.setRound(round);
    }

    public void setDicesBot1(int[] dicesBot1) {this.statistic.setDicesBot1(dicesBot1);}

    public void setDicesBot2(int[] dicesBot2) {this.statistic.setDicesBot2(dicesBot2);}

    public void setTokenBot1(int tokenBot1) {this.statistic.setTokenBot1(tokenBot1);}

    public void setTokenBot2(int tokenBot2) {
        this.statistic.setTokenBot2(tokenBot2);
    }

    public void setStandardGame(boolean standardGame) {this.statistic.setStandardGame(standardGame);}

    public void setCardDeck(int cardDeck) {this.statistic.setCardDeck(cardDeck);}

    public void setTokenStat(int tokenStat) {this.statistic.setTokenStat(tokenStat);}

    public void save(){
        statisticsDBDao.insert(statistic);
    }

    public Statistic load(){
        return statisticsDBDao.getLastStatistic();
    }
}
