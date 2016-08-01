<div class="page-header">
  <h1  id="page-title">Configuration Files</h1>
</div>


***
#### appConfig.ts
The app will not start properly without the presence of the __appConfig.ts__ file. It defines the
app version and base url to the GitHub APIs.



* __version:__ the app version
* __baseURL:__ base URL to the GitHub APIs


```javascript
export let data = {
		"version" : "1.0.2",
    "baseURL" : "https://api./github.com"
}
```



***
#### config.xml
The __config.xml__ is standard and defines attributes of a cordova app. Most attributes
are standard and not explained in this document.



The __widget__ element contains some attributes important to either an iOS or Android build.

* __ios-CFBundleIdentifier:__ must match the bundle ID in xCode
* __ios-CFBundleVersion:__ defines the iOS version
* __version:__ defines the Android version
* __android-packageName"__ used by android as the package (identifier) name


```xml
&ltwidget id="com.wyomingsoftware.gitmobile" android-packageName="com.wyomingsoftware.gitmobile"
ios-CFBundleIdentifier="com.wyomingsoftware.git-mobile" version="1.0.2"
ios-CFBundleVersion="1.0.2" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
```

___
<div style="margin:0 auto;text-align:center;">END</div>
