package team.wuerfelpoker.team1_wuerfelpoker.dal;

import java.util.Arrays;

public class Statistic {
    public int[] dicesPlayer = new int[7];
    public String[] cardsPlayer;
    public int round;
    public int[] dicesBot1 = new int[7];
    public int[] dicesBot2 = new int[7];
    public int tokenBot1;
    public int tokenBot2;

    public boolean standardGame;

    public int cardDeck;

    public int tokenStat;

    public Statistic(int[] dicesPlayer, String[] cardsPlayer, int round, int[] dicesBot1, int[] dicesBot2, int tokenBot1, int tokenBot2, boolean standardGame, int cardDeck, int tokenStat) {
        this.dicesPlayer = dicesPlayer;
        this.cardsPlayer = cardsPlayer;
        this.round = round;
        this.dicesBot1 = dicesBot1;
        this.dicesBot2 = dicesBot2;
        this.tokenBot1 = tokenBot1;
        this.tokenBot2 = tokenBot2;
        this.standardGame = standardGame;
        this.cardDeck = cardDeck;
        this.tokenStat = tokenStat;
    }

    public Statistic() {
    }

    public int[] getDicesPlayer() {
        return dicesPlayer;
    }

    public void setDicesPlayer(int[] dicesPlayer) {
        this.dicesPlayer = dicesPlayer;
    }

    public String[] getCardsPlayer() {
        return cardsPlayer;
    }

    public void setCardsPlayer(String[] cardsPlayer) {
        this.cardsPlayer = cardsPlayer;
    }

    public int getRound() {
        return round;
    }

    public void setRound(int round) {
        this.round = round;
    }

    public int[] getDicesBot1() {
        return dicesBot1;
    }

    public void setDicesBot1(int[] dicesBot1) {
        this.dicesBot1 = dicesBot1;
    }

    public int[] getDicesBot2() {
        return dicesBot2;
    }

    public void setDicesBot2(int[] dicesBot2) {
        this.dicesBot2 = dicesBot2;
    }

    public int getTokenBot1() {
        return tokenBot1;
    }

    public void setTokenBot1(int tokenBot1) {
        this.tokenBot1 = tokenBot1;
    }

    public int getTokenBot2() {
        return tokenBot2;
    }

    public void setTokenBot2(int tokenBot2) {
        this.tokenBot2 = tokenBot2;
    }

    public boolean isStandardGame() {
        return standardGame;
    }

    public void setStandardGame(boolean standardGame) {
        this.standardGame = standardGame;
    }

    public int getCardDeck() {
        return cardDeck;
    }

    public void setCardDeck(int cardDeck) {
        this.cardDeck = cardDeck;
    }


    public int getTokenStat() {
        return tokenStat;
    }

    public void setTokenStat(int tokenStat) {
        this.tokenStat = tokenStat;
    }

    @Override
    public String toString() {
        return "Statistic{" +
                "dicesPlayer=" + Arrays.toString(dicesPlayer) +
                ", cardsPlayer=" + Arrays.toString(cardsPlayer) +
                ", round=" + round +
                ", dicesBot1=" + Arrays.toString(dicesBot1) +
                ", dicesBot2=" + Arrays.toString(dicesBot2) +
                ", tokenBot1=" + tokenBot1 +
                ", tokenBot2=" + tokenBot2 +
                ", standardGame=" + standardGame +
                ", cardDeck=" + cardDeck +
                ", tokenStat=" + tokenStat +
                '}';
    }
}
