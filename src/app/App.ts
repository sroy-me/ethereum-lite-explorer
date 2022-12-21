import {App as AppComponent} from 'app/components/App'
import {LoggerFactory} from 'app/factory/LoggerFactory'
import {StorageFactory} from 'app/factory/StorageFactory'
import {UserPreferences} from 'app/UserPreferences'
import {GoogleAnalytics} from 'app/util/GoogleAnalytics'
import {Hotjar} from 'app/util/Hotjar'
import {onReactionError} from 'mobx'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {AppConfig} from './AppConfig'

export class App {
    async init(target: HTMLElement) {
        let storage = new StorageFactory(window.localStorage).create()
        let userPreferences = new UserPreferences(storage)
        userPreferences.load()

        let appConfigData: any
        try {
            appConfigData = require('./../config.json')
        } catch (e) {
            // No logging support yet
            // tslint:disable-next-line:no-console
            console.error(`Couldn't load application config`, e)
            return
        }

        let appConfig = new AppConfig(userPreferences)
        appConfig.fromJson(appConfigData)

        let logger = new LoggerFactory(appConfig).create()

        let gaId = appConfig.getGoogleAnalyticsId()
        if (gaId) {
            new GoogleAnalytics(gaId, logger).init()
        }
        let hjId = appConfig.getHotjarId()
        if (hjId) {
            new Hotjar(hjId).init()
        }

        onReactionError((e) => {
            logger.error(e)
        })

        ReactDOM.render(
            React.createElement(AppComponent, {
                appConfig,
                logger,
                userPreferences,
            }),
            target
        )
    }
}
