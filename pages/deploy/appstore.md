<div class="page-header">
  <h1  id="page-title">Deployments > App Store</h1>
</div>

Instructions to deploy Git-Mobile to Apple's App Store.






***
#### Update config.xml

A few attributes need to be verified prior to creating a release build.

Be sure that the **(ios-CFBundleIdentifier)** key in the widget element is correctly set
and has not been changed as Xcode will use it as the Bundle Identifier. Without the **(ios-CFBundleIdentifier)** key Xcode would use the
**(id)** key which does not have the hyphen.

Note that the package name is different for IOS and Android. Cordova will not allow hyphens in the “id”. It converts them to an underscore for the android-packageName.

Set the **(version)** and **(ios-CFBundleVersion)** version number keys to the desired version. Example: version ="0.8.0".


<br/>
```json
id="com.wyomingsoftware.gitmobile"
android-packageName="com.wyomingsoftware.gitmobile"
ios-CFBundleIdentifier="com.wyomingsoftware.git-mobile"
version="x.x.x"
ios-CFBundleVersion="x.x.x"
```

<br/>[View master/config.xml](https://github.com/wkande/git-mobile/blob/master/config.xml)

***
#### Update appConfig.ts

Set the **(version)** key to the desired version value.

<br/>
```jsonexport let data = {
		"version" : "x.x.x"

```

<br/>[View master/appConfig.ts](https://github.com/wkande/git-mobile/blob/master/appConfig.ts)




***
#### Create Release
Create a release build.

```bash
ionic build ios
TARGET=PROD ionic prepare --release ios
```



***
#### Verify Version/Build/BundleIdentifier
Verify the version number, build number, and bundle identifier in XCode.

> ![](img/ios-identity.png)



***
#### Verify Deployment Info
Verify in Xcode. **Orientation** must be set manually since Xcode does not pick it up from the config.xml file.
Set **Target** to 9.0, check all selections for **Device Orientation**, and check **Requires Full Screen**.

> ![](img/ios-deployment-info.png)



***
#### Create Archive
In XCode create an Archive. If the menu Product > Archive is disabled
you may need to switch to Git-Mobile and Generic iOS Device.

> ![](img/ios-archive.png)

Create a new Archive, then validate it, and lastly upload it to the App Store.




***
#### Error: CFBundleIconFile invalid path
/platforms/ios/Git-Mobile/Git-Mobile-Info.plist file has a key for a CFBundleIconFile.  It may generate an error while the IPA uploads to the App Store and not during the building of the Archive.  Removing it seems to work OK.  

See the following internet reference:

http://stackoverflow.com/questions/28165916/error-itms-90032invalid-image-path-no-image-found-at-the-path-referenced-und

<br/>
```xml
<key>CFBundleIconFile</key>
<string>icon.png</string>
```



***
#### Itunes
Go to
[itunesconnect](https://itunesconnect.apple.com) to manage the archive uploaded by Xcode.



***
#### GitHub Release
After both the release files have been created and uploaded to both the App and
Play Stores create a [GitHub Release](/index.html?md=pages_deploy_githubreleases.md);



***
<div style="margin:0 auto;text-align:center;">END</div>
