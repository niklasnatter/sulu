// @flow
import React from 'react';
import {observer, Observer} from 'mobx-react';
import {action, observable} from 'mobx';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import MediaUploadStore from '../../stores/MediaUploadStore';
import MediaItem from './MediaItem';
import DropzoneOverlay from './DropzoneOverlay';
import dropzoneStyles from './dropzone.scss';
import type {IObservableValue} from 'mobx'; // eslint-disable-line import/named
import type {ElementRef, Node} from 'react';

type Props = {
    children: Node,
    className?: string,
    collectionId: ?string | number,
    locale: IObservableValue<string>,
    onClose: () => void,
    onOpen: () => void,
    onUpload: (media: Array<Object>) => void,
    onUploadError: (errors: Array<Object>) => void,
    open: boolean,
};

@observer
class MultiMediaDropzone extends React.Component<Props> {
    dropzoneRef: ElementRef<Dropzone>;

    @observable mediaUploadStores: Array<MediaUploadStore> = [];

    setDropzoneRef = (ref: Dropzone) => {
        this.dropzoneRef = ref;
    };

    @action addMediaUploadStore(mediaUploadStore: MediaUploadStore) {
        this.mediaUploadStores.push(mediaUploadStore);
    }

    @action destroyMediaUploadStores() {
        this.mediaUploadStores = [];
    }

    createMediaItems(): Array<*> {
        return this.mediaUploadStores.map((mediaUploadStore, index) => (
            <MediaItem key={index} store={mediaUploadStore} />
        ));
    }

    handleDragEnter = () => {
        const {collectionId, onOpen} = this.props;

        if (collectionId) {
            onOpen();
        }
    };

    handleDragLeave = () => {
        this.props.onClose();
    };

    handleOverlayClose = () => {
        this.props.onClose();
    };

    handleDrop = (files: Array<File>) => {
        const {
            locale,
            collectionId,
            onClose,
            onUpload,
            onUploadError,
        } = this.props;
        const uploadPromises = [];

        if (!collectionId) {
            return;
        }

        files.forEach((file) => {
            const mediaUploadStore = new MediaUploadStore(undefined, locale);
            const uploadPromise = mediaUploadStore.create(collectionId, file);

            uploadPromises.push(uploadPromise);
            this.addMediaUploadStore(mediaUploadStore);
        });

        return Promise.allSettled(uploadPromises).then((results) => {
            const uploadedMedias = [];
            const errorResponses = [];

            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    uploadedMedias.push(result.value);
                } else {
                    errorResponses.push(result.reason);
                }
            });

            if (errorResponses.length === 0) {
                onUpload(uploadedMedias);
            } else {
                onUploadError(errorResponses);
            }

            setTimeout(() => {
                onClose();
                this.destroyMediaUploadStores();
            }, 1000);
        });
    };

    handleOverlayClick = () => {
        this.dropzoneRef.open();
    };

    render() {
        const {children, className, open} = this.props;

        const dropzoneClass = classNames(
            dropzoneStyles.dropzone,
            className
        );

        return (
            <Dropzone
                noClick={true}
                onDragEnter={this.handleDragEnter}
                onDrop={this.handleDrop}
                ref={this.setDropzoneRef}
                style={{}} // to disable default style
            >
                {({getInputProps, getRootProps}) => (
                    <Observer>
                        {() => (
                            <div {...getRootProps({className: dropzoneClass})}>
                                {children}
                                <input {...getInputProps()} />
                                <DropzoneOverlay
                                    onClick={this.handleOverlayClick}
                                    onClose={this.handleOverlayClose}
                                    onDragLeave={this.handleDragLeave}
                                    open={open}
                                >
                                    {this.createMediaItems()}
                                </DropzoneOverlay>
                            </div>
                        )}
                    </Observer>
                )}
            </Dropzone>
        );
    }
}

export default MultiMediaDropzone;
