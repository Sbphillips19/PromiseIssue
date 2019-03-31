// file pulls in all private channels but doesn't block any channels

// returns the private channels
export const getUserPrivateChannels = () => {
  return dispatch => {
    // starts loading flag
    dispatch(loadPrivateChannels());

    // current user from firebase
    let currentUserID = firebaseService.auth().currentUser.uid;

    // firebase users ref
    // export const FIREBASE_REF_USERS = firebaseService.database().ref("Users");
    let currentUserChannelsRef = FIREBASE_REF_USERS.child(`${currentUserID}`)
      .child('chats')
      .child('Private');

    // grabbing snapshot of users channels
    currentUserChannelsRef
      .orderByValue()
      .once('value')
      .then(snapshot => {
        // create array to push promises to
        let privateChannelsToDownload = [];
        snapshot.forEach(childSnapshot => {
          let channelId = childSnapshot.key;
          // see if blocked or not
          privateChannelsToDownload.push(channelId);
        });

        return privateChannelsToDownload;
      })
      .then(privateChannelsDownloaded => {
        return privateChannelsDownloaded.map(channelId => {
          // find the opposite user- the user that is not the current user
          // need this for the profile picture and channel name
          const indexUnderscore = channelId.indexOf('_');
          const channelLength = channelId.length;
          const userLeft = channelId.substring(0, indexUnderscore);
          const userRight = channelId.substring(
            indexUnderscore + 1,
            channelLength
          );

          const oppositeUser =
            userLeft === currentUserID ? userRight : userLeft;

          let oppositeUserValue;

          FIREBASE_REF_USERS.child(`${oppositeUser}`)
            .child('meta')
            .once('value')
            .then(snapshot => {
              oppositeUserValue = snapshot.val();
            });
          let currentUserChannelInfoRef = FIREBASE_REF_CHANNEL_INFO.child(
            'Private'
          ).child(`${channelId}`);
          return currentUserChannelInfoRef
            .once('value')
            .then(channelInfoSnapshot => {
              let channelInfo = channelInfoSnapshot.val();
              return {
                id: channelId,
                info: channelInfo,
                users: {
                  id: oppositeUser,
                  profilePicture: oppositeUserValue.profilePicture,
                  username: oppositeUserValue.username
                }
              }; // pass through promise chain
            });
        });
        // return Promise.all(channelDataPromises);
      })
      .then(data => {
        dispatch(loadPrivateChannelsSuccess(data));
      })
      .catch(err => {
        // currentUserChannelsRef query failed or at least one channel download failed
        console.log(err);
        dispatch(loadPrivateChannelsError(err));
      });
  };
};
