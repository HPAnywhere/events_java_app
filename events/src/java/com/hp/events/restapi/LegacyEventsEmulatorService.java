package com.hp.events.restapi;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import com.hp.btoaw.integration.exception.InvalidConfigurationException;
import com.hp.btoaw.integration.service.keyvalue.KeyValueStorageService;

import javax.ws.rs.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Created with IntelliJ IDEA.
 * User: tzarfati
 * Date: 03/03/13
 * Time: 11:23
 * To change this template use File | Settings | File Templates.
 */
@Service
@Path("/backendLegacyEventsEmulator")
@Produces("application/json;charset=utf-8")
public class LegacyEventsEmulatorService {
	
    @Autowired
    KeyValueStorageService keyValueStorageService;
    
    private static final String DEFAULT_PRS_CATEGORY = "events";
    private static final String DEFAULT_IDs_LIST_KEY = "IDs";
    private static final ObjectMapper mapper = new ObjectMapper();

    @GET
    public List<EventVo> getAll() throws JsonParseException, JsonMappingException, IOException {
    	List<EventVo> events = new ArrayList<EventVo>();
        //	get IDs list
    	String readResult = keyValueStorageService.get(DEFAULT_PRS_CATEGORY, DEFAULT_IDs_LIST_KEY);
    	if (readResult != null) {
	    	EventAppIDsContainer idAppIDsContainer = mapper.readValue(readResult, EventAppIDsContainer.class);
	    	//	read events one by one
    		for (String idString : idAppIDsContainer.idArrayList) {
    			events.add(getEvent(idString));
    		}
    	} else {
    		//	inject our initial examples if the list is empty
			events.add(new EventVo("1", "Docs review", "2013-05-20", EventVo.NORMAL, "system"));			
			addEvent(events.get(0));
			events.add(new EventVo("2", "Docs final review", "2013-07-22", EventVo.HIGH, "system"));
			addEvent(events.get(1));
    	}
		return events;
    }

    @GET
    @Path("{id}")
    public EventVo getEvent(@PathParam("id") String id) throws JsonParseException, JsonMappingException, IOException {
        EventVo event = null;
    	String readResult = keyValueStorageService.get(DEFAULT_PRS_CATEGORY, id);
    	if (readResult != null) {
	    	event = mapper.readValue(readResult, EventVo.class);
    	}
    	return event;
    }

    @POST
    @Consumes("application/json;charset=utf-8")
    public EventVo addEvent(EventVo event) throws JsonParseException, JsonMappingException, IOException {
    	//	first of all save the event, the old one will be overwritten if present
    	keyValueStorageService.put(DEFAULT_PRS_CATEGORY, event.id, mapper.writeValueAsString(event), null);
    	//	update IDs list
    	EventAppIDsContainer idAppIDsContainer;
    	String readResult = keyValueStorageService.get(DEFAULT_PRS_CATEGORY, DEFAULT_IDs_LIST_KEY);
    	if (readResult != null) {
    		idAppIDsContainer = mapper.readValue(readResult, EventAppIDsContainer.class);
	    	if (idAppIDsContainer.idArrayList.contains(event.id)) return event;
    	} else {
    		idAppIDsContainer = new EventAppIDsContainer();
    	}
    	idAppIDsContainer.idArrayList.add(event.id);
		keyValueStorageService.put(DEFAULT_PRS_CATEGORY, DEFAULT_IDs_LIST_KEY, mapper.writeValueAsString(idAppIDsContainer), null);
    	return event;
    }

    @PUT
    @Path("{id}")
    @Consumes("application/json;charset=utf-8")
    public EventVo updateEvent(@PathParam("id") String id, EventVo event) throws JsonGenerationException, JsonMappingException, IOException {
    	event.setId(id);
    	keyValueStorageService.put(DEFAULT_PRS_CATEGORY, event.id, mapper.writeValueAsString(event), null);
    	return event;
    }
    
    @DELETE
    public void deleteAll(@QueryParam("insertDummyData") boolean insertDummyData ) throws JsonParseException, JsonMappingException, IOException {
        //	get IDs list
    	EventVo tmpEventVo;
    	EventAppIDsContainer idAppIDsContainer;
    	String readResult = keyValueStorageService.get(DEFAULT_PRS_CATEGORY, DEFAULT_IDs_LIST_KEY);
    	
    	if (readResult != null) {
	    	idAppIDsContainer = mapper.readValue(readResult, EventAppIDsContainer.class);
	    	//	delete events one by one
    		for (String id : idAppIDsContainer.idArrayList) {
    			keyValueStorageService.remove(DEFAULT_PRS_CATEGORY, id);
    		}
    	}
    	idAppIDsContainer = new EventAppIDsContainer();
    	keyValueStorageService.put(DEFAULT_PRS_CATEGORY, DEFAULT_IDs_LIST_KEY, mapper.writeValueAsString(idAppIDsContainer), null);
    		
    	//	insert data if you please...
    	if(insertDummyData) {
    		//	inject our initial examples if the list is empty
			tmpEventVo = new EventVo("1", "Docs review", "2013-05-20", EventVo.NORMAL, "system");			
			addEvent(tmpEventVo);
			tmpEventVo = new EventVo("2", "Docs final review", "2013-07-22", EventVo.HIGH, "system");
			addEvent(tmpEventVo);
    	}
    }
    
    @DELETE
    @Path("{id}")
    public void deleteEvent(@PathParam("id") String id) throws JsonParseException, JsonMappingException, IOException {
    	keyValueStorageService.remove(DEFAULT_PRS_CATEGORY, id);    	
    	//	update IDs list
    	String readResult = keyValueStorageService.get(DEFAULT_PRS_CATEGORY, DEFAULT_IDs_LIST_KEY);
    	if (readResult != null) {
	    	EventAppIDsContainer idAppIDsContainer = mapper.readValue(readResult, EventAppIDsContainer.class);
    		idAppIDsContainer.idArrayList.remove(id);
    		keyValueStorageService.put(DEFAULT_PRS_CATEGORY, DEFAULT_IDs_LIST_KEY, mapper.writeValueAsString(idAppIDsContainer), null);
    	}
    }
}
