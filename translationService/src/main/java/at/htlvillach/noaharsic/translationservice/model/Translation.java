package at.htlvillach.noaharsic.translationservice.model;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Translation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "idtotranslate")
    private Word toTranslate;

    @ManyToOne
    @JoinColumn(name = "idtranslated")
    private Word translated;

    @Column
    private int difficulty;

    public Translation(int id, Word toTranslate, Word translated, int difficulty) {
        this.id = id;
        this.toTranslate = toTranslate;
        this.translated = translated;
        this.difficulty = difficulty;
    }

    public Translation() {

    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Word getToTranslate() {
        return toTranslate;
    }

    public void setToTranslate(Word toTranslate) {
        this.toTranslate = toTranslate;
    }

    public Word getTranslated() {
        return translated;
    }

    public void setTranslated(Word translated) {
        this.translated = translated;
    }

    public int getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(int difficulty) {
        this.difficulty = difficulty;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Translation that = (Translation) o;
        return id == that.id && difficulty == that.difficulty && Objects.equals(toTranslate, that.toTranslate) && Objects.equals(translated, that.translated);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, toTranslate, translated, difficulty);
    }

    @Override
    public String toString() {
        return "Translation{" +
                "id=" + id +
                ", toTranslate=" + toTranslate +
                ", translated=" + translated +
                ", difficulty=" + difficulty +
                '}';
    }
}
