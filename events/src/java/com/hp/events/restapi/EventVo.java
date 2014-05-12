package com.hp.events.restapi;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;


@XmlRootElement(name = "event")
public class EventVo implements Serializable {


    String id;
    String title;
    String date;
    String importance;
    String owner;

    public static final String NORMAL = "NORMAL";
    public static final String HIGH = "HIGH";

    public EventVo() {
    }
    public EventVo(String id, String title, String date, String importance, String owner) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.importance = importance;
        this.owner = owner;
    }

    public EventVo(String id) {

        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getImportance() {
        return importance;
    }

    public void setImportance(String importance) {
        this.importance = importance;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    @NotNull
    @Size(min = 1)
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }


    @NotNull
    @Size(min = 1)
    @XmlElement
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EventVo)) return false;

        EventVo that = (EventVo) o;

        if (id != null ? !id.equals(that.id) : that.id != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;

        return result;
    }
}