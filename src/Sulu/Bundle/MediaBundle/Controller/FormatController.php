<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\MediaBundle\Controller;

use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\View\ViewHandlerInterface;
use Sulu\Bundle\MediaBundle\Media\FormatManager\FormatManagerInterface;
use Sulu\Bundle\MediaBundle\Media\Manager\MediaManagerInterface;
use Sulu\Component\Rest\ListBuilder\CollectionRepresentation;
use Sulu\Component\Rest\RequestParametersTrait;
use Sulu\Component\Rest\RestController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class FormatController extends RestController implements ClassResourceInterface
{
    use RequestParametersTrait;

    /**
     * @var FormatManagerInterface
     */
    private $formatManager;

    public function __construct(
        ViewHandlerInterface $viewHandler,
        FormatManagerInterface $formatManager
    ) {
        parent::__construct($viewHandler);

        $this->formatManager = $formatManager;
    }

    public function cgetAction(Request $request)
    {
        $locale = $this->getRequestParameter($request, 'locale', true);

        return $this->handleView($this->view(
            new CollectionRepresentation(
                array_values($this->formatManager->getFormatDefinitions($locale)),
                'formats'
            )
        ));
    }
}
