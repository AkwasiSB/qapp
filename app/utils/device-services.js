import { PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import { qFileUri } from '~/config/constants';



/* device filesystem operations */
export const hFS = {
	getPermission(callback) {
		PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
			.then((resp) => {
				if (!resp) {
					PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
						.then((resp) => {
							if (resp == 'granted') {
								callback();
							}
						});
				}
				else {
					callback();
				}
			});
	},

	composeAppPath(path) {
		const mainPath = `${RNFetchBlob.fs.dirs.SDCardDir}/Q`;

	 	return path ? `${mainPath}${path}` : mainPath;
	},

	composeProfileImagePath(imagename) {
		return `file://${RNFetchBlob.fs.dirs.SDCardDir}/Q/User/${imagename}`
	},

	composeContactImagePath(imagename) {
		return `file://${RNFetchBlob.fs.dirs.SDCardDir}/Q/Media/Received/Images/${imagename}`
	},

	isRemoteFile(filePath) {
		const fileHost = filePath.split(':')[0];
		const isRemote = ['https', 'ftps', 'http', 'ftp'].includes(fileHost);

		return isRemote ? true : false;
	},

	getFileName(filePath, separateExt) {
		let p = filePath.split('?')[0];
		const pElems = p.split('/');
		p = pElems[pElems.length - 1];

		if (separateExt) {
			const file = p.split('.');
			return [file[0], file[file.length - 1]];
		}
		else {
			return [p];
		}
	},

	freeSpace() {
		return RNFetchBlob.fs.df();
	},

	pathExists(path, type) {
		if (type === 'directory') {
			return RNFetchBlob.fs.isDir(path);
		}
		else {
			return RNFetchBlob.fs.exists(path);
		}
	},

	deleteLocalFile(filePath) {
		return RNFetchBlob.fs.unlink(filePath);
	},

	copyFile(srcPath, destPath) {
		return new Promise((resolve, reject) => {
			RNFetchBlob.fs.cp(srcPath, destPath)
				.then(() => {
					RNFetchBlob.fs.scanFile([{ path: destPath }])
						.then(() => {
							resolve(destPath);
						}, (err) => {
							resolve(destPath);
						});
				})
				.catch(err => {
					reject(err);
				});
		});
	},
	
	uploadFile(localPath) {
		const filenameComponent = this.getFileName(localPath, true);

	  	return new Promise((resolve, reject) => {
			RNFetchBlob.fetch('POST', qFileUri, {
			      	'Accept': 'application/json',
					'Content-Type': 'multipart/form-data'
				}, [{
					name: 'data',
					filename: `${filenameComponent[0]}.${filenameComponent[1]}`,
					data: RNFetchBlob.wrap(localPath)
				}]
			)
			.then((res) => {
				return res.json();
			})
			.then((file) => {
				resolve(file);
			})
			.catch((err) => {
				reject(err);
			});
		});
	},

	downloadFile(remotePath, localPath) {
		return new Promise((resolve, reject) => {
			RNFetchBlob.config({
				path: localPath
			})
			.fetch('GET', remotePath)
			.then((res) => {
				RNFetchBlob.fs.scanFile([{ path: res.path() }])
					.then(() => {
						resolve(res.path());
					}, (err) => {
						resolve(res.path());
					});
			})
			.catch(err => {
				reject(err);
			});
		});
	},

	createHipalFolders() {
		return new Promise((resolve, reject) => {
			let dirHipal = RNFetchBlob.fs.dirs.SDCardDir + '/Q';

	        RNFetchBlob.fs.mkdir(dirHipal)
		        .then((resp) => {
		        	return RNFetchBlob.fs.mkdir(dirHipal + '/User');
		        })
		        .then((resp) => {
		        	return RNFetchBlob.fs.mkdir(dirHipal + '/Media');
		        })
		        .then((resp) => {
		        	return RNFetchBlob.fs.mkdir(dirHipal + '/Media/Sent');
		        })
		        .then((resp) => {
		        	return RNFetchBlob.fs.mkdir(dirHipal + '/Media/Sent/Images');
		        })
		        .then((resp) => {
		        	return RNFetchBlob.fs.mkdir(dirHipal + '/Media/Sent/Videos');
		        })
		        .then((resp) => {
		        	return RNFetchBlob.fs.mkdir(dirHipal + '/Media/Received');
		        })
		        .then((resp) => {
		        	return RNFetchBlob.fs.mkdir(dirHipal + '/Media/Received/Images');
		        })
		        .then((resp) => {
		        	return RNFetchBlob.fs.mkdir(dirHipal + '/Media/Received/Videos');
		        })
		        .then((resp) => {
		        	resolve(null);
		        })
				.catch((err) => {
				    reject(err);
				});
		});
	}
};



/* device camera operations */
export const hCamera = {
	getPermission(callback) {
		PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
			.then((resp) => {
				if (!resp) {
					PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
						.then((resp) => {
							if (resp == 'granted') {
								callback();
							}
						});
				}
				else {
					callback();
				}
			});
	},

	openGallery(multipleSelect, cropOption) {
		if (cropOption && cropOption.crop) {
			return ImagePicker.openPicker({
				multiple: (multipleSelect) ? multipleSelect : false,
				cropping: cropOption.crop,
				width: (cropOption.width) ? cropOption.width : 400,
				height: (cropOption.height) ? cropOption.height : 400
			});
		}
		else {
			return ImagePicker.openPicker({
				multiple: (multipleSelect) ? multipleSelect : false
			});
		}
	},

	openCamera(cropOption) {
		if (cropOption && cropOption.crop) {
			return ImagePicker.openCamera({
				cropping: cropOption.crop,
				width: (cropOption.width) ? cropOption.width : 400,
				height: (cropOption.height) ? cropOption.height : 400
			});
		}
		else {
			return ImagePicker.openCamera();
		}
	},

	clearCache() {
		ImagePicker.clean().then(() => {

		}).catch(err => {

		});
	}
};
