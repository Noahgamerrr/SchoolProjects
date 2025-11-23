package team.wuerfelpoker.team1_wuerfelpoker.music;

import javafx.animation.KeyFrame;
import javafx.animation.KeyValue;
import javafx.animation.Timeline;
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;
import javafx.util.Duration;
import java.net.URISyntaxException;
import java.util.Objects;

public class Music {
	private MediaPlayer player;
	private static Music m;

    private static Music sfx;
	private static final int SECS = 3;

	private float volume = 1;

	public float getVolume() {
		return volume;
	}

	public void setVolume(float volume) {
		this.volume = volume;
	}

	private Music() {
	}
	public static Music getInstance(){
		if(m == null) {
			m = new Music();
			m.setVolume(0.5f);
		}

		return m;
	}

    public static Music getInstanceSFX(){
        if(sfx == null)
            sfx = new Music();
        return sfx;
    }


	public void start(String path) {
		this.fadeOut(SECS);
		try {
			this.fadeIn(SECS, path);
		} catch (URISyntaxException e) {
			throw new RuntimeException(e);
		}
	}

	private void fadeOut(int secs) {
		if (player == null) return;
		Timeline timeline = new Timeline(
				new KeyFrame(Duration.seconds(secs), new KeyValue(player.volumeProperty(), 0)));
		timeline.play();
		var p = player;
		delay(secs, p::stop);

	}

	private void fadeIn(int secs, String path) throws URISyntaxException {
		player = makeMediaPlayer(path);
		player.volumeProperty().setValue(0);

		Timeline timeline = new Timeline(
				new KeyFrame(Duration.seconds(secs), new KeyValue(player.volumeProperty(), 1)));
		delay(secs, timeline::play);
		var p = player;
		delay(secs, p::play);

	}
	public void hardStart(String path){
		if(player != null)
			player.stop();
		player = makeMediaPlayer(path);
		player.setVolume(volume);
		player.play();
	}

	public void hardStartInf(String path){
		if(player != null) player.stop();
		player = makeMediaPlayer(path);
		player.setCycleCount(MediaPlayer.INDEFINITE);
		player.play();
	}
	private void delay(int secs, Runnable r){
		new java.util.Timer().schedule(new java.util.TimerTask() {
			@Override
			public void run() {
				r.run();
			}
		}, secs * 1000);
	}

	public MediaPlayer getPlayer() {
		return player;
	}
	private MediaPlayer makeMediaPlayer(String path){
		var m = new MediaPlayer(new Media("file://" + Objects.requireNonNull(getClass().getResource(path)).getFile()));
		m.setOnEndOfMedia(m::play);
		return m;
	}


}
