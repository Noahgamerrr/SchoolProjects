package at.htlvillach.noaharsic.schnuppern.model;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Anmeldung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_schnuppertermin")
    private Schnuppertermin schnuppertermin;
    @Column
    private String vorname;
    @Column
    private String nachname;
    @Column
    private String derzeitigeSchule;
    @Column
    private String derzeitigeKlasse;
    @Column
    private String telefonnummer;
    @Column
    private String emailadresse;
    @Column
    private boolean brauchtBestaetigung;
    @Column
    private String sonstiges;

    public Anmeldung() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Schnuppertermin getSchnuppertermin() {
        return schnuppertermin;
    }

    public void setSchnuppertermin(Schnuppertermin schnuppertermin) {
        this.schnuppertermin = schnuppertermin;
    }

    public String getVorname() {
        return vorname;
    }

    public void setVorname(String vorname) {
        this.vorname = vorname;
    }

    public String getNachname() {
        return nachname;
    }

    public void setNachname(String nachname) {
        this.nachname = nachname;
    }

    public String getDerzeitigeSchule() {
        return derzeitigeSchule;
    }

    public void setDerzeitigeSchule(String derzeitigeSchule) {
        this.derzeitigeSchule = derzeitigeSchule;
    }

    public String getDerzeitigeKlasse() {
        return derzeitigeKlasse;
    }

    public void setDerzeitigeKlasse(String derzeitigeKlasse) {
        this.derzeitigeKlasse = derzeitigeKlasse;
    }

    public String getTelefonnummer() {
        return telefonnummer;
    }

    public void setTelefonnummer(String telefonnummer) {
        this.telefonnummer = telefonnummer;
    }

    public String getEmailadresse() {
        return emailadresse;
    }

    public void setEmailadresse(String emailadresse) {
        this.emailadresse = emailadresse;
    }

    public boolean isBrauchtBestaetigung() {
        return brauchtBestaetigung;
    }

    public void setBrauchtBestaetigung(boolean brauchtBestaetigung) {
        this.brauchtBestaetigung = brauchtBestaetigung;
    }

    public String getSonstiges() {
        return sonstiges;
    }

    public void setSonstiges(String sonstiges) {
        this.sonstiges = sonstiges;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Anmeldung anmeldung = (Anmeldung) o;
        return id == anmeldung.id && brauchtBestaetigung == anmeldung.brauchtBestaetigung && Objects.equals(schnuppertermin, anmeldung.schnuppertermin) && Objects.equals(vorname, anmeldung.vorname) && Objects.equals(nachname, anmeldung.nachname) && Objects.equals(derzeitigeSchule, anmeldung.derzeitigeSchule) && Objects.equals(derzeitigeKlasse, anmeldung.derzeitigeKlasse) && Objects.equals(telefonnummer, anmeldung.telefonnummer) && Objects.equals(emailadresse, anmeldung.emailadresse) && Objects.equals(sonstiges, anmeldung.sonstiges);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, schnuppertermin, vorname, nachname, derzeitigeSchule, derzeitigeKlasse, telefonnummer, emailadresse, brauchtBestaetigung, sonstiges);
    }

    @Override
    public String toString() {
        return "Anmeldung{" +
                "id=" + id +
                ", schnuppertermin=" + schnuppertermin +
                ", vorname='" + vorname + '\'' +
                ", nachname='" + nachname + '\'' +
                ", derzeitigeSchule='" + derzeitigeSchule + '\'' +
                ", derzeitigeKlasse='" + derzeitigeKlasse + '\'' +
                ", telefonnummer='" + telefonnummer + '\'' +
                ", emailadresse='" + emailadresse + '\'' +
                ", brauchtBestaetigung=" + brauchtBestaetigung +
                ", sonstiges='" + sonstiges + '\'' +
                '}';
    }
}
