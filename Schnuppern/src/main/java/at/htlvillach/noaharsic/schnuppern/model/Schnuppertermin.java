package at.htlvillach.noaharsic.schnuppern.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Objects;
import java.util.Set;

@Entity
public class Schnuppertermin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @OneToMany(mappedBy = "schnuppertermin")
    @JsonIgnore
    private Set<Anmeldung> anmeldungen;
    @Column
    private LocalDate datum;
    @Column
    private String klasse;
    @Column
    private boolean lehrerInformiert;
    @Column
    private String zustaendigerSchueler;

    public Schnuppertermin() {
    }

    public Schnuppertermin(LocalDate datum, String klasse, boolean lehrerInformiert, String zustaendigerSchueler) {
        this.datum = datum;
        this.klasse = klasse;
        this.lehrerInformiert = lehrerInformiert;
        this.zustaendigerSchueler = zustaendigerSchueler;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Set<Anmeldung> getAnmeldungen() {
        return anmeldungen;
    }

    public void setAnmeldungen(Set<Anmeldung> anmeldungen) {
        this.anmeldungen = anmeldungen;
    }

    public LocalDate getDatum() {
        return datum;
    }

    public void setDatum(LocalDate datum) {
        this.datum = datum;
    }

    public String getKlasse() {
        return klasse;
    }

    public void setKlasse(String klasse) {
        this.klasse = klasse;
    }

    public boolean isLehrerInformiert() {
        return lehrerInformiert;
    }

    public void setLehrerInformiert(boolean lehrerInformiert) {
        this.lehrerInformiert = lehrerInformiert;
    }

    public String getZustaendigerSchueler() {
        return zustaendigerSchueler;
    }

    public void setZustaendigerSchueler(String zustaendigerSchueler) {
        this.zustaendigerSchueler = zustaendigerSchueler;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Schnuppertermin that = (Schnuppertermin) o;
        return id == that.id && lehrerInformiert == that.lehrerInformiert && Objects.equals(datum, that.datum) && Objects.equals(klasse, that.klasse) && Objects.equals(zustaendigerSchueler, that.zustaendigerSchueler);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, anmeldungen, datum, klasse, lehrerInformiert, zustaendigerSchueler);
    }

    @Override
    public String toString() {
        return "Schnuppertermin{" +
                "id=" + id +
                ", anmeldungen=" + anmeldungen +
                ", datum=" + datum +
                ", klasse='" + klasse + '\'' +
                ", lehrerInformiert=" + lehrerInformiert +
                ", zustaendigerSchueler='" + zustaendigerSchueler + '\'' +
                '}';
    }
}
