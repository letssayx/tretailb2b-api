package com.example.quartz.model;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class ClientReq{
  
    private Integer id;
    private Integer interval;
    private Boolean start;
}