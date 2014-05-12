package com.hp.events.restapi;

import com.hp.btoaw.integration.data.DSConfiguration;
import com.hp.btoaw.integration.exception.InvalidConfigurationException;
import com.hp.btoaw.integration.service.DataSourceService;
import com.hp.btoaw.integration.service.exception.MissingSettingException;
import com.hp.btoaw.integration.service.security.LWSSOService;
import com.hp.btoaw.integration.service.security.UserInfoService;
import com.hp.btoaw.integration.service.settings.AdminSettingsService;

import com.hp.events.bl.Consts;
import com.hp.events.bl.DataSourceConsts;
import com.hp.events.bl.EventsApp;
import com.sun.jersey.api.core.HttpContext;
import com.sun.jersey.json.impl.provider.entity.JSONObjectProvider;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.codehaus.jettison.json.JSONWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Cookie;
import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
@Path("/events")
@Produces("application/json;charset=utf-8")
public class EventsRestService {

    @Autowired
    RestTemplate restClient;
    @Autowired
    LWSSOService securityService;
    @Autowired
    DataSourceService dataSourceService;
    @Autowired
    EventsApp eventsApp;

    @Autowired
    private UserInfoService userInfoService;
    @Autowired
    private AdminSettingsService adminSettingsService;

    private static Logger logger = LoggerFactory.getLogger(EventsRestService.class);
    private static List<EventVo> allEvents = null;
    private static String SERVICE_SUFFIX_PATH = "services/backendLegacyEventsEmulator";
    private static String EVENT_NOTIFICATION_TYPE = "new.event.notification";
    private static String EVENT_NOTIFICATION_MESSAGE = "New event notification created by Event app";
    private static String DEFAULT_VISIBILITY = "PRIVATE";
    private static EventVo emptyResponse = new EventVo();


    @GET
    public List<EventVo> getAll(@Context HttpContext context) {    	
        List<EventVo> events = new ArrayList<EventVo>();
        String requestUrl = null;
        String rawUrl = context.getRequest().getAbsolutePath().getPath();

        try {
            requestUrl = getBackendDatasourceBaseUrl(rawUrl) + SERVICE_SUFFIX_PATH;
        } catch (InvalidConfigurationException e) {
            logger.error("Failed to retrieve data source configuration details, with exception:" + e);
            //error occurred, returning empty events list
            //return events;
            return null;
        }

        HttpEntity requestEntity = createRequestEntityBySessionCookie(MediaType.APPLICATION_JSON);

        ResponseEntity<EventVo[]> response = null;
        

        try {
            response = restClient.exchange(requestUrl, HttpMethod.GET, requestEntity, EventVo[].class);
        } catch (RestClientException e) {
            logger.warn("get all events failed with RestClientException", e);
        }

        if (response != null) {
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.debug("received successful response status ");
            } else {
                logger.error("response status is:" + response.getStatusCode());
            }
            return Arrays.asList(response.getBody());
        } else {
            return events;
        }
    }

    @GET
    @Path("{id}")
    public EventVo getEvent(@Context HttpContext context, @PathParam("id") String id) {
        EventVo event = new EventVo();
        String requestUrl = null;
        String rawUrl = context.getRequest().getAbsolutePath().getPath();

        try {
            requestUrl = getBackendDatasourceBaseUrl(rawUrl) + SERVICE_SUFFIX_PATH + "/{id}";
        } catch (InvalidConfigurationException e) {
            logger.error("Failed to retrieve data source configuration details, with exception:" + e);
            //error occurred, returning empty events list
            //return event;
            return null;
        }

        HttpEntity requestEntity = createRequestEntityBySessionCookie(MediaType.APPLICATION_JSON);

        ResponseEntity<EventVo> response = null;
        Map<String, String> uriParams = new HashMap<String, String>();
        uriParams.put("id", id);

        try {
            response = restClient.exchange(requestUrl, HttpMethod.GET, requestEntity, EventVo.class, uriParams);
        } catch (RestClientException e) {
            logger.warn("get event id:" + id + " failed with RestClientException", e);
        }

        if (response != null) {
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.debug("received successful response status ");
            } else {
                logger.error("response status is:" + response.getStatusCode());
            }
            return response.getBody();
        } else {
            return emptyResponse;
        }

    }

    @POST
    @Consumes("application/json;charset=utf-8")
    public EventVo addEvent(@Context HttpContext context, EventVo event) {

        EventVo ms = new EventVo(Long.toString(new Date().getTime()), event.getTitle(), event.getDate(), event.getImportance(), event.getOwner());
        String requestUrl = null;
        String rawUrl = context.getRequest().getAbsolutePath().getPath();
        
        try {
            requestUrl = getBackendDatasourceBaseUrl(rawUrl) + SERVICE_SUFFIX_PATH;
        } catch (InvalidConfigurationException e) {
            logger.error("Failed to retrieve data source configuration details, with exception:" + e);
            //error occurred, returning empty events list
            //return event;
            return null;
        }

        HttpEntity requestEntity = createRequestEntityBySessionCookie(MediaType.APPLICATION_JSON, ms);

        ResponseEntity<EventVo> response = null;

        try {
            response = restClient.exchange(requestUrl, HttpMethod.POST, requestEntity, EventVo.class);
        } catch (RestClientException e) {
            logger.warn("add event failed with RestClientException", e);
        }

        if (response != null) {
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.debug("received successful response status ");
                try {
                    if (isAutomaticCreateActivityEnabled()) {

                        EventVo vo = response.getBody();

                        invokeEvent(vo);
                    } else {
                        logger.debug("skip automatic create activity on add event, since this option is disabled in the admin settings");
                    }
                } catch (MissingSettingException e) {
                    logger.error("failed to find automatic create activity setting in the admin settings");
                }
            } else {
                logger.error("response status is:" + response.getStatusCode());
            }
            return response.getBody();
        } else {
            return emptyResponse;
        }

    }

    @PUT
    @Path("{id}")
    @Consumes("application/json;charset=utf-8")
    public EventVo updateEvent(@Context HttpContext context, @PathParam("id") String id, EventVo eventVo) {

        String requestUrl = null;
        String rawUrl = context.getRequest().getAbsolutePath().getPath();

        try {
            requestUrl = getBackendDatasourceBaseUrl(rawUrl) + SERVICE_SUFFIX_PATH + "/{id}";
        } catch (InvalidConfigurationException e) {
            logger.error("Failed to retrieve data source configuration details, with exception:" + e);
            //error occurred, returning empty events list
            return null;
        }

        HttpEntity requestEntity = createRequestEntityBySessionCookie(MediaType.APPLICATION_JSON, eventVo);


        ResponseEntity<EventVo> response = null;
        Map<String, String> uriParams = new HashMap<String, String>();
        uriParams.put("id", id);
        try {
            response = restClient.exchange(requestUrl, HttpMethod.PUT, requestEntity, EventVo.class, uriParams);
        } catch (RestClientException e) {
            logger.warn("update event failed with RestClientException", e);
        }

        if (response != null) {
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.debug("received successful response status ");
            } else {
                logger.error("response status is:" + response.getStatusCode());
            }
            return response.getBody();
        } else {
            return emptyResponse;
        }

    }

    @DELETE
    public void deleteAll(@Context HttpContext context, @QueryParam("insertDummyData") @DefaultValue("true") boolean insertDummyData ) {
        String requestUrl = null;
        String rawUrl = context.getRequest().getAbsolutePath().getPath();
        
        try {
            requestUrl = getBackendDatasourceBaseUrl(rawUrl) + SERVICE_SUFFIX_PATH;
        } catch (InvalidConfigurationException e) {
            logger.error("Failed to retrieve data source configuration details, with exception:" + e);
        }

        HttpEntity requestEntity = createRequestEntityBySessionCookie(MediaType.APPLICATION_JSON);

        ResponseEntity<EventVo> response = null;
        
        try {
            response = restClient.exchange(requestUrl, HttpMethod.DELETE, requestEntity, EventVo.class);
        } catch (RestClientException e) {
            logger.warn("deleteAll event failed with RestClientException", e);
        }

        if (response != null) {
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.debug("received successful response status ");
            } else {
                logger.error("response status is:" + response.getStatusCode());
            }
        }
    }

    @DELETE
    @Path("{id}")
    public void deleteEvent(@Context HttpContext context, @PathParam("id") String id) {
        String requestUrl = null;
        String rawUrl = context.getRequest().getAbsolutePath().getPath();
        
        try {
            requestUrl = getBackendDatasourceBaseUrl(rawUrl) + SERVICE_SUFFIX_PATH + "/{id}";
        } catch (InvalidConfigurationException e) {
            logger.error("Failed to retrieve data source configuration details, with exception:" + e);
        }

        HttpEntity requestEntity = createRequestEntityBySessionCookie(MediaType.APPLICATION_JSON);

        ResponseEntity<EventVo> response = null;
        Map<String, String> uriParams = new HashMap<String, String>();
        uriParams.put("id", id);

        try {
            response = restClient.exchange(requestUrl, HttpMethod.DELETE, requestEntity, EventVo.class, uriParams);
        } catch (RestClientException e) {
            logger.warn("delete event failed with RestClientException", e);
        }

        if (response != null) {
            if (response.getStatusCode() == HttpStatus.OK) {
                logger.debug("received successful response status ");
            } else {
                logger.error("response status is:" + response.getStatusCode());
            }
        }
    }


    private String getBackendDatasourceBaseUrl(String rawUrl) throws InvalidConfigurationException {
    	//get events web folder
    	String urlFolder = rawUrl.split("/")[1];
        //retrieve data source configuration from the HPA server
        DSConfiguration dataSource = dataSourceService.getDataSourceConfig(eventsApp.getID() + "-DS", null);
        
        //build the base url to access the backend according to the value of known data source properties
        String protocol = (String) dataSource.getPropertyValue(DataSourceConsts.PROTOCOL_KEY_NAME);
        String hostname = (String) dataSource.getPropertyValue(DataSourceConsts.HOSTNAME_KEY_NAME);
        String port = (String) dataSource.getPropertyValue(DataSourceConsts.PORT_KEY_NAME);

        String requestUrl = protocol + "://" + hostname + ":" + port + "/" + urlFolder + "/";

        return requestUrl;
    }

    private HttpEntity createRequestEntityBySessionCookie(MediaType mediaType) {
        return createRequestEntityBySessionCookie(mediaType, null);
    }

    @SuppressWarnings("deprecation")
	private HttpEntity createRequestEntityBySessionCookie(MediaType mediaType, Object requestObject) {

        Cookie sessionCookie = null;

        try {
            sessionCookie = securityService.getSecurityCookie(userInfoService.getUserName());
            logger.debug("Success to get cookie from session , cookie name : " + sessionCookie.getName() + " , Cookie value: " + sessionCookie.getValue());
        } catch (Exception e) {
            logger.error("failed to retrieve session cookie", e);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("X-CSRF-HPMEAP", "FROM-EVENTS-APP");
        if (sessionCookie != null) {
            headers.add("Cookie", sessionCookie.getName() + "=" + sessionCookie.getValue() + ";" + sessionCookie);
        } else {
            logger.error("session cookie is missing, return requestEntity without cookie");
        }
        HttpEntity request;
        if (requestObject == null) {
            request = new HttpEntity(headers);
        } else {
            request = new HttpEntity(requestObject, headers);
        }

        return request;
    }

    private void invokeEvent(EventVo vo) {
        String currentUserId;

        try {
            currentUserId = userInfoService.getUserUniqueId();

        } catch (Exception e) {
            logger.error("failed to retrieve current user unique ID, skip invokeEvent " + e);
            return;
        }

        JSONObject notificationEventJson = null;
        try {
            notificationEventJson = buildNotificationEvent(UUID.randomUUID().toString(), currentUserId, vo, EVENT_NOTIFICATION_MESSAGE, EVENT_NOTIFICATION_TYPE, DEFAULT_VISIBILITY);
        } catch (JSONException e) {
            logger.error("failed to build event notification JSON, skip invokeEvent " + e);
            return;
        }

        sendNotificationEvent(notificationEventJson);
    }

    private JSONObject buildNotificationEvent(String eventId, String currentUserId, EventVo vo, String message, String notificationType, String visibility) throws JSONException {
        String jsonString = "{}";
        String contextObjectId = vo.getId();

        ObjectMapper mapper = new ObjectMapper();

        String metaData;
        /*try {
            metaData = mapper.writeValueAsString(vo);

        } catch (IOException e) {
            logger.warn("failed to write event as JSON string, metaData = {} ", e);

            metaData = "{}";

        }*/

        metaData = "{\\\"id\\\":\\\"" + vo.getId() +
                "\\\",\\\"owner\\\":\\\"" + vo.getOwner() +
                "\\\",\\\"date\\\":\\\"" + vo.getDate() +
                "\\\",\\\"importance\\\":\\\"" + vo.getImportance() +
                "\\\",\\\"title\\\":\\\"" + vo.getTitle() + "\\\"}";

        jsonString = "{" +
                "\"id\": \"eventId1\"," +
                "\"contextObjects\": [" +
                "{" +
                "\"objectId\": \"" + contextObjectId + "\"," +
                "\"dataType\": \"" + Consts.DATA_TYPE + "\"," +
                "\"displayName\": \"Calendar Event\"," +
                "\"metaData\": \"" + metaData + "\"," +
                "\"app\": {" +
                "\"id\": \"" + eventsApp.getID() + "\"" +
                "}" +
                "}" +
                "]," +
                "\"message\": \"" + message + "\"," +
                "\"users\":    [" +
                "{ \"id\": \"" + currentUserId + "\"," +
                "\"isNotify\": \"true\"" +
                "}," +
                "{ \"id\": \"" + "user_1@hp.com\"," +
                "\"isNotify\": \"true\"" +
                "}" +
                "]," +
                "\"visibility\": \"" + visibility + "\"," +
                "\"notificationType\": \"" + notificationType + "\"," +
                "\"subject\": \"" + vo.getTitle() + "\"" +
                "}";

        JSONObject notificationEventJson = notificationEventJson = new JSONObject(jsonString);
        return notificationEventJson;
    }

    private void sendNotificationEvent(JSONObject notificationEventJson) {
        String requestUrl = null;
        try {
            requestUrl = getHPAServerEventRestUrl();
        } catch (MissingSettingException e) {
            logger.error("Failed to send notification, due to failure when retrieving the HPA server URL" + e);
            return;
        }
        HttpEntity requestEntity = createRequestEntityBySessionCookie(MediaType.APPLICATION_JSON, notificationEventJson.toString());

        ResponseEntity<EventVo> response = null;
        Map<String, String> uriParams = new HashMap<String, String>();
        uriParams.put("appId", eventsApp.getID());
        try {
            response = restClient.exchange(requestUrl, HttpMethod.POST, requestEntity, EventVo.class, uriParams);
        } catch (RestClientException e) {
            logger.warn("send notificationupdate event failed with RestClientException", e);
        }

        if (response != null) {
            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.NO_CONTENT) {
                logger.debug("received successful response status");
            } else {
                logger.error("response status is:" + response.getStatusCode());
            }
        }
    }

    private String getHPAServerEventRestUrl() throws MissingSettingException {
        return adminSettingsService.getAdminSetting(eventsApp.getID(), Consts.HPA_BASE_URL_KEY) + Consts.HANDLE_EVENT_URI_SUFFIX;
    }

    private boolean isAutomaticCreateActivityEnabled() throws MissingSettingException {
        return Boolean.valueOf(adminSettingsService.getAdminSetting(eventsApp.getID(), Consts.AUTO_CREATE_ACTIVITY_KEY));
    }
}
