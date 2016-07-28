
<div class="page-header">
  <h1  id="page-title">Deployments > Play Store</h1>
</div>

Instructions to deploy Git-Mobile to Google's Play Store.




***
#### Update config.xml

A few attributes need to be verified prior to creating a release build.


Be sure that the **(android-packageName)** key in the widget element is correct.
Note that the package name is different for IOS and Android. Cordova will not allow
hyphens in the “id”. It converts them to an underscore for the android-packageName. Cordova for iOS does not use the ID when building to
create the ios-CFBundleIdentifier.
To keep the Android build consistent no hyphens are
used for the package name.




Set the **(version)** number key to the desired value. Example: version ="0.8.0".


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















***
#### GitHub Release
After both the release files have been created and uploaded to both the App and
Play Stores create a [GitHub Release](/index.html?md=pages_deploy_githubreleases.md);



***
<div style="margin:0 auto;text-align:center;">END</div>
