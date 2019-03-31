// get private chat channels
export const getUserPrivateChannels = () => {
  return async dispatch => {
    // loading until channels are received
    dispatch(loadPrivateChannels());
    // current users
    let currentUserID = firebaseService.auth().currentUser.uid;
    // reference to blocked in firebase realtime database
    return FIREBASE_REF_BLOCKED.child(currentUserID)
      .once('value')
      .then(blockSnapshot => {
        return blockSnapshot.val();
      })
      .then(async blockedChannels => {
        // users current channels firebase ref
        let currentUserChannelsRef = FIREBASE_REF_USERS.child(
          `${currentUserID}`
        )
          .child('chats')
          .child('Private');
        const snapshot = await currentUserChannelsRef
          .orderByValue()
          .once('value');
        // array to put private channels
        let privateChannelsToDownload = [];
        snapshot.forEach(childSnapshot => {
          // get channelID and see get the opposite users ID from the string
          // example channel "9MCIZT0AlXdmuJwcQ6y9YfPB8Pl1_UnyUnLK1o7QFM4q0tk4qQF2rQps2"
          let channelId = childSnapshot.key;
          const indexUnderscore = channelId.indexOf('_');
          const channelLength = channelId.length;
          const userLeft = channelId.substring(0, indexUnderscore);
          const userRight = channelId.substring(
            indexUnderscore + 1,
            channelLength
          );
          const oppositeUser =
            userLeft === currentUserID ? userRight : userLeft;
          // only push code up if the user is not in the blocked channels
          if (typeof blockedChannels[oppositeUser].channelId === 'undefined') {
            // push user to channels to download array
            privateChannelsToDownload.push(channelId);
          }
        });
        const privateChannelsDownloaded = privateChannelsToDownload;
        console.log('PRIV DOWN', privateChannelsDownloaded);
        let channelDataPromises = privateChannelsDownloaded.map(
          async channelId_1 => {
            // find the opposite user- the user that is not the current user
            // need this for the profile picture and channel name
            const indexUnderscore_1 = channelId_1.indexOf('_');
            const channelLength_1 = channelId_1.length;
            const userLeft_1 = channelId_1.substring(0, indexUnderscore_1);
            const userRight_1 = channelId_1.substring(
              indexUnderscore_1 + 1,
              channelLength_1
            );
            const oppositeUser_1 =
              userLeft_1 === currentUserID ? userRight_1 : userLeft_1;
            let oppositeUserValue;

            // get user information to display
            return FIREBASE_REF_USERS.child(`${oppositeUser_1}`)
              .child('meta')
              .once('value')
              .then(async snapshot_1 => {
                oppositeUserValue = snapshot_1.val();

                let currentUserChannelInfoRef = FIREBASE_REF_CHANNEL_INFO.child(
                  'Private'
                ).child(`${channelId_1}`);
                const channelInfoSnapshot = await currentUserChannelInfoRef.once(
                  'value'
                );
                let channelInfo = channelInfoSnapshot.val();
                return {
                  id: channelId_1,
                  info: channelInfo,
                  users: {
                    id: oppositeUser_1,
                    profilePicture: oppositeUserValue.profilePicture,
                    username: oppositeUserValue.username
                  }
                };
              });
          }
        );
        // pass through promise chain // pass through promise chain
        const data = await Promise.all(channelDataPromises);
        // send private channels to redux store
        dispatch(loadPrivateChannelsSuccess(data));
      })
      .catch(err => {
        // currentUserChannelsRef query failed or at least one channel download failed
        console.log(err);
        dispatch(loadPrivateChannelsError(err));
      });
  };
};
