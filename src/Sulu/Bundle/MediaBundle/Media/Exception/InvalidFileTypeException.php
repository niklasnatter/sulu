<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\MediaBundle\Media\Exception;

class InvalidFileTypeException extends UploadFileException
{
    /**
     * @param string $message
     */
    public function __construct($message, \Throwable $previous = null)
    {
        parent::__construct($message, self::EXCEPTION_CODE_BLOCKED_FILE_TYPE, $previous);
    }
}
