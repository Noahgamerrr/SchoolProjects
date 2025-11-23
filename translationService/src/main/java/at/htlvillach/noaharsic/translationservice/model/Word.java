package at.htlvillach.noaharsic.translationservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;
import java.util.Objects;

@Entity
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "IDLANGUAGE")
    private Language language;

    @Column
    private String vocable;

    @OneToMany(mappedBy = "toTranslate")
    @JsonIgnore
    private List<Translation> translations;

    public Word(int id, Language language, String vocable, List<Translation> translations) {
        this.id = id;
        this.language = language;
        this.vocable = vocable;
        this.translations = translations;
    }

    public Word() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Language getLanguage() {
        return language;
    }

    public void setLanguage(Language language) {
        this.language = language;
    }

    public String getVocable() {
        return vocable;
    }

    public void setVocable(String vocable) {
        this.vocable = vocable;
    }

    public List<Translation> getTranslations() {
        return translations;
    }

    public void setTranslations(List<Translation> translations) {
        this.translations = translations;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Word word = (Word) o;
        return id == word.id && Objects.equals(language, word.language) && Objects.equals(vocable, word.vocable) && Objects.equals(translations, word.translations);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, language, vocable, translations);
    }

    @Override
    public String toString() {
        return "Word{" +
                "id=" + id +
                ", language=" + language +
                ", vocable='" + vocable + '\'' +
                '}';
    }
}
