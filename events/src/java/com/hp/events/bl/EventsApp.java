package com.hp.events.bl;

import com.hp.btoaw.integration.data.BTOContext;
import com.hp.btoaw.integration.data.UserProfile;
import com.hp.btoaw.integration.data.UserProfileFactory;
import com.hp.btoaw.integration.data.miniapp.*;
import com.hp.btoaw.integration.service.DataSourceService;
import com.hp.btoaw.integration.service.bl.AbstractBTOServiceEE;
import com.hp.btoaw.integration.service.exception.CustomException;
import com.hp.btoaw.integration.service.provider.DataSourceProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashSet;
import java.util.Locale;

@Service("events")
public class EventsApp extends AbstractBTOServiceEE {

    private static Logger logger = LoggerFactory.getLogger(EventsApp.class);

    @Autowired
    private DataSourceService dataSourceService;

    /**
     * Returns the entry points that the app service recommends to the user as the next entry point to open in the activity.<br />
     * Typically called when users have activity with context objects and
     * when users have open entry points in the activity canvas.<br />
     *
     * Inspect the context IDs, types, and metadata in the context object collection to determine whether the context
     * is relevant to the entry point recommendation.
     *
     * @param btoContexts the collection of contexts in the user activity
     * @param entryPointDefinitions the collection of currently opened entry points for the current user activity
     * @return collection of the recommended entry points by this app service according to the given list of contexts and opened entry points
     * @throws CustomException
     */
    @Override
    public Collection<EntryPointDefinition> getEntryPointDefinitionsByContext(Collection<BTOContext> btoContexts, Collection<EntryPointDefinition> entryPointDefinitions) throws CustomException {
        Collection<EntryPointDefinition> output = this.getSupportedEntryPointDefinitionsNoContext();

        Locale userLocale = this.getLocale();

        App app = AppFactory.create(getID(), getLocalizedServiceName(userLocale));

        for (BTOContext context : btoContexts) {
            if (Consts.DATA_TYPE.equalsIgnoreCase(context.getDataType())) {

                EntryPoint ep = EntryPointFactory.create(Consts.EP_EDIT, this.getString(userLocale, Consts.EP_EDIT));
                EntryPointDefinition def = EntryPointDefinitionFactory.create(app, ep);
                output.add(def);

                break;

            }

        }

        return output;
    }

    /**
    * Returns the collection of all available entry points.
    *
    * @return Collection of EntryPointDefinition - a list of all the entry points which available for the user in the implementing app service
    * @throws CustomException
    */
    @Override
    public Collection<EntryPointDefinition> getSupportedEntryPointDefinitionsNoContext() throws CustomException {

        Collection<EntryPointDefinition> output = new HashSet<EntryPointDefinition>();
        Locale userLocale = this.getLocale();

        App app = AppFactory.create(getID(), getLocalizedServiceName(userLocale));

        EntryPoint ep = EntryPointFactory.create(Consts.EP_LIST, this.getString(userLocale, Consts.EP_LIST));
        EntryPointDefinition def = EntryPointDefinitionFactory.create(app, ep);
        output.add(def);

        EntryPoint ep2 = EntryPointFactory.create(Consts.EP_ADD, this.getString(userLocale, Consts.EP_ADD));
        EntryPointDefinition def2 = EntryPointDefinitionFactory.create(app, ep2);
        output.add(def2);


        return output;

    }

    /**
     * Returns the users that the app service recommends as participants in the current user activity.<br />
     * Typically called when users have activity with context objects and
     * when users have open entry points in the activity canvas.<br />
     *
     * Inspect the context IDs, types, and metadata in the context object collection to determine whether the context
     * is relevant to recommended users. <br />
     *
     *
     * Typical implementation flow is:
     * <ul><li>get the app data source </li>
     * <li>retrieve relevant users IDs data according to the context id</li></ul>
     *
     * @param btoContexts the collection of contexts in the user activity
     * @return Collection of the suggested user profiles. For users defined in the user repository, the user profile is userId String. For external users, it is an email address.
     * @throws CustomException
     */
    @Override
    public Collection<UserProfile> getRelatedUsers(Collection<BTOContext> btoContexts) throws CustomException {

        Collection<UserProfile> output = new HashSet<UserProfile>();
        // ADD USERS BY CONTEXT
        if (btoContexts != null) {


            for (BTOContext btoContext : btoContexts) {

                if (Consts.DATA_TYPE.equalsIgnoreCase(btoContext.getDataType())) {
                    // todo: fetch the events of the event
                    UserProfile profile = UserProfileFactory.createProfile(btoContext.getMetaData());
                    output.add(profile);
                    return output;
                }
            }
        }

        UserProfile profile = UserProfileFactory.createProfile(Consts.SUPPORT_EMAIL);
        output.add(profile);

        return output;
    }

    /*
    * a connector prototype to this EventApp's Backend
    * return null, since we implemented the data source provider by an xml file: EventsApp-ds-provider.xml
    *
    * */
    @Override
    public DataSourceProvider getDataSourceProvider() {
        return null;
    }

}


