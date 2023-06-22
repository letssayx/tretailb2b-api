package com.example.quartz.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.math.BigInteger;
import java.sql.Timestamp;

@Entity // This tells Hibernate to make a table out of this class
@Table(name = "logs")
@Getter
@Setter
public class Log {
    
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private BigInteger id;
    private String name;
    private String description;
    private String input_files;
    private String output_files;
    private Timestamp updated_at;
    private Timestamp created_at;
    private String status;
    private String topic;
    private String progress;
    private String context;
    private String csv_buffer;
    private Boolean job_running;

}
